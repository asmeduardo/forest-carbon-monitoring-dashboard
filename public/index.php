<?php
// public/index.php

// Set content type
header('Content-Type: application/json');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load autoloader (using Composer)
require_once __DIR__ . '/../vendor/autoload.php';

// Import necessary classes
use ForestMonitoring\Database\DatabaseConnection;
use ForestMonitoring\Database\Repository\ForestRepository;
use ForestMonitoring\Database\Repository\UserRepository;
use ForestMonitoring\Services\AuthService;
use ForestMonitoring\Services\CarbonCalculatorService;
use ForestMonitoring\Controllers\ForestController;
use ForestMonitoring\Controllers\UserController;

// Initialize database connection
$dbConnection = DatabaseConnection::getInstance();

// Initialize repositories
$forestRepository = new ForestRepository($dbConnection);
$userRepository = new UserRepository($dbConnection);

// Initialize services
$authService = new AuthService($userRepository);
$carbonCalculatorService = new CarbonCalculatorService();

// Initialize controllers
$forestController = new ForestController($forestRepository, $authService, $carbonCalculatorService);
$userController = new UserController($authService);

// Route the request
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle API routes
if (strpos($uri, '/api/') === 0) {
    $route = substr($uri, 5); // Remove '/api/' prefix

    switch ($route) {
        // Forest data routes
        case 'forest/data':
            if ($method === 'GET') {
                // Get all forest data
                echo json_encode($forestController->getAllData());
            } elseif ($method === 'POST') {
                // Create new forest data
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($forestController->createData($data));
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'forest/stats':
            if ($method === 'GET') {
                // Get forest stats by period
                $period = $_GET['period'] ?? 'day';
                echo json_encode($forestController->getDataByPeriod($period));
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'forest/carbon':
            if ($method === 'GET') {
                // Get carbon impact stats
                $period = $_GET['period'] ?? 'year';
                echo json_encode($forestController->getCarbonStats($period));
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        // User routes
        case 'user/login':
            if ($method === 'POST') {
                // Login user
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($userController->login($data));
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'user/password/reset':
            if ($method === 'POST') {
                // Reset password
                $data = json_decode(file_get_contents('php://input'), true);
                echo json_encode($userController->resetPassword($data));
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'user/profile':
            if ($method === 'GET') {
                // Get user profile
                echo json_encode($userController->getProfile());
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        case 'user/logout':
            if ($method === 'POST') {
                // Logout user
                echo json_encode($userController->logout());
            } else {
                http_response_code(405); // Method Not Allowed
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;

        default:
            http_response_code(404); // Not Found
            echo json_encode(['error' => 'Route not found']);
            break;
    }
} else {
    // Serve the frontend app (redirect to index.html)
    include __DIR__ . '/index.html';
}
