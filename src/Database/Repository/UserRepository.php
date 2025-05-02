<?php
// src/Database/Repository/UserRepository.php

namespace ForestMonitoring\Database\Repository;

use ForestMonitoring\Database\DatabaseConnection;
use ForestMonitoring\Models\User;
use PDO;
use PDOException;

/**
 * User repository for database operations
 */
class UserRepository
{
    private PDO $db;

    /**
     * Constructor with dependency injection
     */
    public function __construct(DatabaseConnection $dbConnection)
    {
        $this->db = $dbConnection->getConnection();
    }

    /**
     * Find user by username
     * 
     * @param string $username
     * @return User|null
     */
    public function findByUsername(string $username): ?User
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, username, senha_hash, primeiro_acesso, created_at, updated_at 
                FROM usuarios 
                WHERE username = :username
            ");

            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->execute();

            $userData = $stmt->fetch();

            if (!$userData) {
                return null;
            }

            return User::fromArray($userData);
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Find user by ID
     * 
     * @param int $id
     * @return User|null
     */
    public function findById(int $id): ?User
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, username, senha_hash, primeiro_acesso, created_at, updated_at 
                FROM usuarios 
                WHERE id = :id
            ");

            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $userData = $stmt->fetch();

            if (!$userData) {
                return null;
            }

            return User::fromArray($userData);
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update user password
     * 
     * @param int $userId
     * @param string $passwordHash
     * @return bool
     */
    public function updatePassword(int $userId, string $passwordHash): bool
    {
        try {
            $stmt = $this->db->prepare("
                UPDATE usuarios 
                SET senha_hash = :password_hash, 
                    primeiro_acesso = 0,
                    updated_at = NOW()
                WHERE id = :user_id
            ");

            $stmt->bindParam(':password_hash', $passwordHash, PDO::PARAM_STR);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a new user
     * 
     * @param User $user
     * @return int|null ID of the created user or null on failure
     */
    public function create(User $user): ?int
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO usuarios (username, senha_hash, primeiro_acesso, created_at, updated_at)
                VALUES (:username, :password_hash, :first_login, NOW(), NOW())
            ");

            $data = $user->toArray();

            $stmt->bindParam(':username', $data['username'], PDO::PARAM_STR);
            $stmt->bindParam(':password_hash', $data['senha_hash'], PDO::PARAM_STR);
            $stmt->bindParam(':first_login', $data['primeiro_acesso'], PDO::PARAM_INT);

            if ($stmt->execute()) {
                return (int) $this->db->lastInsertId();
            }

            return null;
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return null;
        }
    }
}
