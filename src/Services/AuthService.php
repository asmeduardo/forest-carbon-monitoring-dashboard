<?php
// src/Services/AuthService.php

namespace ForestMonitoring\Services;

use ForestMonitoring\Database\Repository\UserRepository;
use ForestMonitoring\Models\User;

/**
 * Authentication service
 */
class AuthService
{
    private UserRepository $userRepository;
    private array $config;

    /**
     * Constructor with dependency injection
     */
    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
        $this->config = require __DIR__ . '/../../config/config.php';
    }

    /**
     * Authenticate a user
     * 
     * @param string $username
     * @param string $password
     * @return array Authentication result with success status and user data
     */
    public function authenticate(string $username, string $password): array
    {
        $user = $this->userRepository->findByUsername($username);

        if (!$user) {
            return [
                'success' => false,
                'error' => 'Usuário não encontrado',
                'code' => 'user_not_found'
            ];
        }

        if (!password_verify($password, $user->getPasswordHash())) {
            return [
                'success' => false,
                'error' => 'Senha incorreta',
                'code' => 'invalid_password'
            ];
        }

        // Generate JWT token
        $token = $this->generateToken($user);

        return [
            'success' => true,
            'first_login' => $user->isFirstLogin(),
            'user_id' => $user->getId(),
            'username' => $user->getUsername(),
            'token' => $token
        ];
    }

    /**
     * Change user password
     * 
     * @param int $userId
     * @param string $newPassword
     * @return bool
     */
    public function changePassword(int $userId, string $newPassword): bool
    {
        // Validate password
        if (strlen($newPassword) < 8) {
            return false;
        }

        // Hash the password
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        // Update in the database
        return $this->userRepository->updatePassword($userId, $passwordHash);
    }

    /**
     * Generate JWT token
     * 
     * @param User $user
     * @return string
     */
    private function generateToken(User $user): string
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + $this->config['token_expiry'];

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $user->getId(),
            'username' => $user->getUsername()
        ];

        // In a real application, you would use a proper JWT library
        // This is a simplified version for demonstration
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$header.$payload", $this->config['jwt_secret'], true);
        $signature = base64_encode($signature);

        return "$header.$payload.$signature";
    }

    /**
     * Verify JWT token
     * 
     * @param string $token
     * @return array|null User data or null if invalid
     */
    public function verifyToken(string $token): ?array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        $payloadData = json_decode(base64_decode($payload), true);

        // Check if token is expired
        if (!isset($payloadData['exp']) || $payloadData['exp'] < time()) {
            return null;
        }

        // Verify signature
        $valid = hash_hmac('sha256', "$header.$payload", $this->config['jwt_secret'], true);
        $valid = base64_encode($valid);

        if ($signature !== $valid) {
            return null;
        }

        return [
            'user_id' => $payloadData['user_id'],
            'username' => $payloadData['username']
        ];
    }

    /**
     * Get current authenticated user
     * 
     * @return User|null
     */
    public function getCurrentUser(): ?User
    {
        if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return null;
        }

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace('Bearer ', '', $authHeader);

        $userData = $this->verifyToken($token);

        if (!$userData) {
            return null;
        }

        return $this->userRepository->findById($userData['user_id']);
    }
}
