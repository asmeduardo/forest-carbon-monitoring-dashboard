<?php
// src/Database/Repository/ForestRepository.php

namespace ForestMonitoring\Database\Repository;

use ForestMonitoring\Database\DatabaseConnection;
use ForestMonitoring\Models\ForestData;
use PDO;
use PDOException;

/**
 * Forest data repository for database operations
 */
class ForestRepository
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
     * Get all forest data ordered by date
     * 
     * @return array
     */
    public function findAll(): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, data, acao, quantidade, usuario_id, created_at 
                FROM dados_florestais 
                ORDER BY data ASC
            ");

            $stmt->execute();
            $results = $stmt->fetchAll();

            $forestData = [];
            foreach ($results as $result) {
                $forestData[] = ForestData::fromArray($result);
            }

            return $forestData;
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Find forest data by date range
     * 
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    public function findByDateRange(string $startDate, string $endDate): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, data, acao, quantidade, usuario_id, created_at 
                FROM dados_florestais 
                WHERE data BETWEEN :start_date AND :end_date
                ORDER BY data ASC
            ");

            $stmt->bindParam(':start_date', $startDate, PDO::PARAM_STR);
            $stmt->bindParam(':end_date', $endDate, PDO::PARAM_STR);
            $stmt->execute();

            $results = $stmt->fetchAll();

            $forestData = [];
            foreach ($results as $result) {
                $forestData[] = ForestData::fromArray($result);
            }

            return $forestData;
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create new forest data entry
     * 
     * @param ForestData $forestData
     * @return bool
     */
    public function create(ForestData $forestData): bool
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO dados_florestais (data, acao, quantidade, usuario_id, created_at)
                VALUES (:date, :action, :quantity, :user_id, NOW())
            ");

            $data = $forestData->toArray();

            $stmt->bindParam(':date', $data['data'], PDO::PARAM_STR);
            $stmt->bindParam(':action', $data['acao'], PDO::PARAM_STR);
            $stmt->bindParam(':quantity', $data['quantidade'], PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $data['usuario_id'], PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get forest data statistics for a period
     * 
     * @param string $period 'day', 'week', 'month', 'year'
     * @param int $limit Number of periods to return
     * @return array
     */
    public function getStatsByPeriod(string $period, int $limit = 30): array
    {
        try {
            $groupBy = '';
            $dateFormat = '';

            switch ($period) {
                case 'day':
                    $groupBy = 'data';
                    $dateFormat = '%Y-%m-%d';
                    break;
                case 'week':
                    $groupBy = 'YEARWEEK(data, 1)';
                    $dateFormat = '%x-W%v';
                    break;
                case 'month':
                    $groupBy = 'YEAR(data), MONTH(data)';
                    $dateFormat = '%Y-%m';
                    break;
                case 'year':
                    $groupBy = 'YEAR(data)';
                    $dateFormat = '%Y';
                    break;
                default:
                    $groupBy = 'data';
                    $dateFormat = '%Y-%m-%d';
            }

            $query = "
                SELECT 
                    DATE_FORMAT(data, '{$dateFormat}') as period,
                    SUM(CASE WHEN acao = 'planted' THEN quantidade ELSE 0 END) as planted,
                    SUM(CASE WHEN acao = 'cut' THEN quantidade ELSE 0 END) as cut
                FROM dados_florestais
                GROUP BY {$groupBy}
                ORDER BY MIN(data) DESC
                LIMIT :limit
            ";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            $results = $stmt->fetchAll();

            // Reverse to get chronological order
            return array_reverse($results);
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            return [];
        }
    }
}
