<?php
// public/index.php

// Configuração de erros para desenvolvimento
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Processar conteúdo JSON
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
if (strpos($contentType, 'application/json') !== false) {
    $_POST = json_decode(file_get_contents('php://input'), true) ?? [];
}

// Verificar se é uma solicitação de arquivo estático
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$extension = pathinfo($uri, PATHINFO_EXTENSION);
if (in_array($extension, ['js', 'css', 'png', 'jpg', 'svg', 'ico'])) {
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath)) {
        // Definir o Content-Type correto
        switch ($extension) {
            case 'js':
                header('Content-Type: application/javascript');
                break;
            case 'css':
                header('Content-Type: text/css');
                break;
            case 'png':
                header('Content-Type: image/png');
                break;
            case 'jpg':
                header('Content-Type: image/jpeg');
                break;
            case 'svg':
                header('Content-Type: image/svg+xml');
                break;
            case 'ico':
                header('Content-Type: image/x-icon');
                break;
        }
        // Enviar o arquivo
        readfile($filePath);
        exit;
    }
}

// Configurar cabeçalhos para API
if (strpos($uri, '/api/') === 0) {
    header('Content-Type: application/json');
} else {
    header('Content-Type: text/html');
}

// Configurar CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Processar requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Carregar autoloader do Composer
require_once __DIR__ . '/../vendor/autoload.php';

// Importar classes necessárias
use ForestMonitoring\Database\DatabaseConnection;
use ForestMonitoring\Database\Repository\ForestRepository;
use ForestMonitoring\Database\Repository\UserRepository;
use ForestMonitoring\Services\AuthService;
use ForestMonitoring\Services\CarbonCalculatorService;
use ForestMonitoring\Controllers\ForestController;
use ForestMonitoring\Controllers\UserController;
use ForestMonitoring\Middleware\AuthMiddleware;

// Inicializar conexão com banco de dados
try {
    $dbConnection = DatabaseConnection::getInstance();

    // Inicializar repositórios
    $forestRepository = new ForestRepository($dbConnection);
    $userRepository = new UserRepository($dbConnection);

    // Inicializar serviços
    $authService = new AuthService($userRepository);
    $carbonCalculatorService = new CarbonCalculatorService();

    // Inicializar controllers
    $forestController = new ForestController($forestRepository, $authService, $carbonCalculatorService);
    $userController = new UserController($authService);

    // Inicializar middleware
    $authMiddleware = new AuthMiddleware($authService);
} catch (Exception $e) {
    if (strpos($uri, '/api/') === 0) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro de configuração: ' . $e->getMessage()]);
        exit;
    } else {
        echo "Erro na configuração do aplicativo. Por favor, verifique os logs do servidor.";
        exit;
    }
}

// Processar rotas
$method = $_SERVER['REQUEST_METHOD'];

// Processar rotas da API
if (strpos($uri, '/api/') === 0) {
    $route = substr($uri, 5); // Remover prefixo '/api/'

    switch ($route) {
        // Rotas de dados florestais
        case 'forest/data':
            if ($method === 'GET') {
                // Obter todos os dados florestais
                echo json_encode($forestController->getAllData());
            } elseif ($method === 'POST') {
                // Para criar dados, o usuário precisa estar autenticado
                if (!$authMiddleware->handle()) {
                    break;
                }
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($forestController->createData($data));
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        case 'forest/stats':
            if ($method === 'GET') {
                // Obter estatísticas por período
                $period = $_GET['period'] ?? 'day';
                echo json_encode($forestController->getDataByPeriod($period));
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        case 'forest/carbon':
            if ($method === 'GET') {
                // Obter estatísticas de carbono
                $period = $_GET['period'] ?? 'year';
                echo json_encode($forestController->getCarbonStats($period));
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        // Rotas de usuário
        case 'user/login':
            if ($method === 'POST') {
                // Login de usuário - NÃO precisa de autenticação
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($userController->login($data));
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        case 'user/password/reset':
            if ($method === 'POST') {
                // Redefinir senha - NÃO precisa de autenticação neste caso específico
                // pois é utilizado no primeiro acesso
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($userController->resetPassword($data));
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        case 'user/profile':
            if ($method === 'GET') {
                // Obter perfil do usuário - precisa de autenticação
                if (!$authMiddleware->handle()) {
                    break;
                }
                echo json_encode($userController->getProfile());
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        case 'user/logout':
            if ($method === 'POST') {
                // Logout do usuário - precisa de autenticação
                if (!$authMiddleware->handle()) {
                    break;
                }
                echo json_encode($userController->logout());
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Método não permitido']);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Rota não encontrada']);
            break;
    }
} else {
    // Servir o frontend (index.html)
    include __DIR__ . '/index.html';
}
