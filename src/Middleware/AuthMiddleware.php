<?php

namespace ForestMonitoring\Middleware;

use ForestMonitoring\Services\AuthService;

class AuthMiddleware
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function handle(): bool
    {
        // Ignorar requisições OPTIONS (CORS preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return true;
        }

        // Verificar header de autorização
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Não autorizado. Token não fornecido.']);
            return false;
        }

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace('Bearer ', '', $authHeader);

        // Verificar token
        $userData = $this->authService->verifyToken($token);
        if (!$userData) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido ou expirado.']);
            return false;
        }

        return true;
    }
}
