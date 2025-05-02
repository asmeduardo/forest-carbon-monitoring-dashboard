<?php
// src/Controllers/ForestController.php

namespace ForestMonitoring\Controllers;

use ForestMonitoring\Database\Repository\ForestRepository;
use ForestMonitoring\Models\ForestData;
use ForestMonitoring\Services\AuthService;
use ForestMonitoring\Services\CarbonCalculatorService;

/**
 * Controller for forest data operations
 */
class ForestController
{
    private ForestRepository $forestRepository;
    private AuthService $authService;
    private CarbonCalculatorService $carbonCalculatorService;

    /**
     * Constructor with dependency injection
     */
    public function __construct(
        ForestRepository $forestRepository,
        AuthService $authService,
        CarbonCalculatorService $carbonCalculatorService
    ) {
        $this->forestRepository = $forestRepository;
        $this->authService = $authService;
        $this->carbonCalculatorService = $carbonCalculatorService;
    }

    /**
     * Get all forest data
     * 
     * @return array Forest data with API format
     */
    public function getAllData(): array
    {
        $forestData = $this->forestRepository->findAll();

        // Convert to API format
        $result = [];
        foreach ($forestData as $data) {
            $result[] = $data->toApiFormat();
        }

        return $result;
    }

    /**
     * Get forest data grouped by period
     * 
     * @param string $period 'day', 'week', 'month', 'year'
     * @param int $limit Number of periods to return
     * @return array Forest data grouped by period with CO2 impact
     */
    public function getDataByPeriod(string $period = 'day', int $limit = 30): array
    {
        $periodData = $this->forestRepository->getStatsByPeriod($period, $limit);

        // Calculate CO2 impact for each period
        $co2Impact = $this->carbonCalculatorService->calculateGroupedImpact($periodData, $period);

        // Combine data with CO2 impact
        $result = [];
        foreach ($periodData as $i => $data) {
            $result[] = array_merge($data, ['co2_impact' => $co2Impact[$i]]);
        }

        return $result;
    }

    /**
     * Create new forest data entry
     * 
     * @param array $data Input data with date, action, and quantity
     * @return array Response with success status and messages
     */
    public function createData(array $data): array
    {
        // Check required fields
        if (!isset($data['date']) || !isset($data['action']) || !isset($data['quantity'])) {
            return [
                'success' => false,
                'error' => 'Dados incompletos. Informe data, ação e quantidade.'
            ];
        }

        // Validate action
        if (!in_array($data['action'], ['planted', 'cut'])) {
            return [
                'success' => false,
                'error' => "Ação inválida. Use 'planted' ou 'cut'."
            ];
        }

        // Validate quantity
        $quantity = (int) $data['quantity'];
        if ($quantity <= 0) {
            return [
                'success' => false,
                'error' => 'A quantidade deve ser maior que zero.'
            ];
        }

        // Get current user
        $currentUser = $this->authService->getCurrentUser();
        if (!$currentUser) {
            return [
                'success' => false,
                'error' => 'Usuário não autenticado.'
            ];
        }

        // Create forest data object
        $forestData = new ForestData(
            $data['date'],
            $data['action'],
            $quantity,
            $currentUser->getId()
        );

        // Save to database
        $result = $this->forestRepository->create($forestData);

        if ($result) {
            // Calculate CO2 impact
            $co2Impact = 0;
            if ($data['action'] === 'planted') {
                $co2Impact = $this->carbonCalculatorService->calculatePlantedImpact($quantity, 'year');
            } else {
                $co2Impact = $this->carbonCalculatorService->calculateCutImpact($quantity);
            }

            return [
                'success' => true,
                'message' => 'Dados cadastrados com sucesso.',
                'co2_impact' => $this->carbonCalculatorService->kgToTons($co2Impact)
            ];
        }

        return [
            'success' => false,
            'error' => 'Erro ao cadastrar os dados.'
        ];
    }

    /**
     * Get carbon impact statistics
     * 
     * @param string $period 'day', 'week', 'month', 'year'
     * @return array Carbon impact statistics
     */
    public function getCarbonStats(string $period = 'year'): array
    {
        $stats = $this->forestRepository->getStatsByPeriod($period, 1);

        if (empty($stats)) {
            return [
                'planted' => 0,
                'cut' => 0,
                'balance' => 0,
                'co2_impact' => 0
            ];
        }

        $lastPeriod = $stats[0];
        $plantedCount = $lastPeriod['planted'] ?? 0;
        $cutCount = $lastPeriod['cut'] ?? 0;
        $balance = $plantedCount - $cutCount;

        $co2Impact = $this->carbonCalculatorService->calculateTotalImpact(
            $plantedCount,
            $cutCount,
            $period
        );

        return [
            'planted' => $plantedCount,
            'cut' => $cutCount,
            'balance' => $balance,
            'co2_impact' => $this->carbonCalculatorService->kgToTons($co2Impact)
        ];
    }
}
