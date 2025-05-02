<?php
// src/Services/CarbonCalculator.php

namespace ForestMonitoring\Services;

/**
 * Service for carbon impact calculations
 */
class CarbonCalculatorService
{
    private float $co2PerTreePerYear;
    private float $co2LossPerCutTree;

    /**
     * Constructor
     */
    public function __construct()
    {
        $config = require __DIR__ . '/../../config/config.php';
        $this->co2PerTreePerYear = $config['co2_per_tree_per_year']; // kg
        $this->co2LossPerCutTree = $config['co2_loss_per_cut_tree']; // kg
    }

    /**
     * Calculate CO2 impact for planted trees (kg)
     * 
     * @param int $treeCount Number of trees
     * @param string $period 'day', 'week', 'month', 'year'
     * @return float CO2 impact in kg
     */
    public function calculatePlantedImpact(int $treeCount, string $period = 'year'): float
    {
        $yearFraction = $this->getPeriodFraction($period);
        return $treeCount * $this->co2PerTreePerYear * $yearFraction;
    }

    /**
     * Calculate CO2 impact for cut trees (kg)
     * 
     * @param int $treeCount Number of trees
     * @return float CO2 impact in kg (negative)
     */
    public function calculateCutImpact(int $treeCount): float
    {
        return -1 * $treeCount * $this->co2LossPerCutTree;
    }

    /**
     * Calculate total CO2 impact (kg)
     * 
     * @param int $plantedCount Number of planted trees
     * @param int $cutCount Number of cut trees
     * @param string $period 'day', 'week', 'month', 'year'
     * @return float Total CO2 impact in kg (can be negative)
     */
    public function calculateTotalImpact(int $plantedCount, int $cutCount, string $period = 'year'): float
    {
        $plantedImpact = $this->calculatePlantedImpact($plantedCount, $period);
        $cutImpact = $this->calculateCutImpact($cutCount);

        return $plantedImpact + $cutImpact;
    }

    /**
     * Convert CO2 impact from kg to tons
     * 
     * @param float $kgCO2 CO2 amount in kg
     * @return float CO2 amount in tons
     */
    public function kgToTons(float $kgCO2): float
    {
        return $kgCO2 / 1000;
    }

    /**
     * Get period as fraction of a year
     * 
     * @param string $period 'day', 'week', 'month', 'year'
     * @return float Fraction of a year
     */
    private function getPeriodFraction(string $period): float
    {
        switch ($period) {
            case 'day':
                return 1 / 365;
            case 'week':
                return 1 / 52;
            case 'month':
                return 1 / 12;
            case 'year':
            default:
                return 1;
        }
    }

    /**
     * Calculate CO2 impact for a group of forest data entries
     * 
     * @param array $entries Array of entries with 'planted' and 'cut' properties
     * @param string $period 'day', 'week', 'month', 'year'
     * @return array CO2 impact for each entry (in tons)
     */
    public function calculateGroupedImpact(array $entries, string $period = 'day'): array
    {
        $results = [];

        foreach ($entries as $entry) {
            $planted = $entry['planted'] ?? 0;
            $cut = $entry['cut'] ?? 0;

            $impact = $this->calculateTotalImpact($planted, $cut, $period);
            $results[] = $this->kgToTons($impact);
        }

        return $results;
    }
}
