<?php
// src/Controllers/UserController.php

namespace ForestMonitoring\Controllers;

use ForestMonitoring\Services\AuthService;

/**
 * Controller for user operations and authentication
 */
class UserController
{
    private AuthService $authService;

    /**
     * Constructor with dependency injection
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login user
     * 
     * @param array $data Login data with username and password
     * @return array Response with authentication result
     */
    public function login(array $data): array
    {
        // Validate required fields
        if (!isset($data['username']) || !isset($data['senha'])) {
            return [
                'success' => false,
                'error' => 'Usuário e senha são obrigatórios.'
            ];
        }

        // Authenticate user
        $result = $this->authService->authenticate($data['username'], $data['senha']);

        return $result;
    }

    /**
     * Reset password
     * 
     * @param array $data Password reset data with user_id and new_password
     * @return array Response with success status
     */
    public function resetPassword(array $data): array
    {
        // Validate required fields
        if (!isset($data['usuario_id']) || !isset($data['nova_senha'])) {
            return [
                'success' => false,
                'error' => 'ID do usuário e nova senha são obrigatórios.'
            ];
        }

        // Validate password
        if (strlen($data['nova_senha']) < 8) {
            return [
                'success' => false,
                'error' => 'A senha deve ter pelo menos 8 caracteres.'
            ];
        }

        // Change password
        $result = $this->authService->changePassword(
            (int) $data['usuario_id'],
            $data['nova_senha']
        );

        if ($result) {
            return [
                'success' => true,
                'message' => 'Senha atualizada com sucesso.'
            ];
        }

        return [
            'success' => false,
            'error' => 'Erro ao atualizar a senha.'
        ];
    }

    /**
     * Get current user profile
     * 
     * @return array User profile or error
     */
    public function getProfile(): array
    {
        $user = $this->authService->getCurrentUser();

        if (!$user) {
            return [
                'success' => false,
                'error' => 'Usuário não autenticado.'
            ];
        }

        return [
            'success' => true,
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'first_login' => $user->isFirstLogin()
            ]
        ];
    }

    /**
     * Logout user (invalidate token on client side)
     * 
     * @return array Success response
     */
    public function logout(): array
    {
        return [
            'success' => true,
            'message' => 'Logout realizado com sucesso.'
        ];
    }
}
