<?php
// src/Database/DatabaseConnection.php

namespace ForestMonitoring\Database;

use PDO;
use PDOException;

/**
 * Singleton class for database connection
 */
class DatabaseConnection
{
    private static ?DatabaseConnection $instance = null;
    private ?PDO $connection = null;

    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct()
    {
        // Configuration will be loaded from config file
        $config = require __DIR__ . '/../../config/config.php';

        try {
            $dsn = "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->connection = new PDO($dsn, $config['db_user'], $config['db_pass'], $options);
        } catch (PDOException $e) {
            // Log error properly instead of exposing it
            error_log("Database Connection Error: " . $e->getMessage());
            throw new PDOException("Database connection failed. Please try again later.");
        }
    }

    /**
     * Get singleton instance
     * 
     * @return DatabaseConnection
     */
    public static function getInstance(): DatabaseConnection
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Get the PDO connection
     * 
     * @return PDO
     */
    public function getConnection(): PDO
    {
        return $this->connection;
    }

    /**
     * Prevent cloning of the instance
     */
    private function __clone() {}

    /**
     * Prevent unserialization of the instance
     */
    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize singleton");
    }
}
