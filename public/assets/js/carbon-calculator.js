/**
 * Carbon Calculator Service
 * Handles CO2 impact calculations
 */
export class CarbonCalculator {
    constructor() {
        // Constants for CO2 calculations
        this.CO2_PER_TREE_PER_YEAR = 21.8; // kg of CO2 absorbed per tree per year
        this.CO2_LOSS_PER_CUT_TREE = 150; // kg of CO2 released per cut tree
    }
    
    /**
     * Calculate CO2 impact for planted trees in kg
     * 
     * @param {number} treeCount - Number of trees
     * @param {string} period - Time period ('day', 'week', 'month', 'year')
     * @returns {number} CO2 impact in kg
     */
    calculatePlantedImpact(treeCount, period = 'year') {
        const yearFraction = this.getPeriodFraction(period);
        return treeCount * this.CO2_PER_TREE_PER_YEAR * yearFraction;
    }
    
    /**
     * Calculate CO2 impact for cut trees in kg
     * 
     * @param {number} treeCount - Number of trees
     * @returns {number} CO2 impact in kg (negative value)
     */
    calculateCutImpact(treeCount) {
        return -1 * treeCount * this.CO2_LOSS_PER_CUT_TREE;
    }
    
    /**
     * Calculate total CO2 impact in kg
     * 
     * @param {number} plantedCount - Number of planted trees
     * @param {number} cutCount - Number of cut trees
     * @param {string} period - Time period ('day', 'week', 'month', 'year')
     * @returns {number} Total CO2 impact in kg
     */
    calculateTotalImpact(plantedCount, cutCount, period = 'year') {
        const plantedImpact = this.calculatePlantedImpact(plantedCount, period);
        const cutImpact = this.calculateCutImpact(cutCount);
        
        return plantedImpact + cutImpact;
    }
    
    /**
     * Convert CO2 impact from kg to tons
     * 
     * @param {number} kgCO2 - Amount of CO2 in kg
     * @returns {number} Amount of CO2 in tons
     */
    kgToTons(kgCO2) {
        return kgCO2 / 1000;
    }
    
    /**
     * Get period as a fraction of a year
     * 
     * @param {string} period - Time period ('day', 'week', 'month', 'year')
     * @returns {number} Fraction of a year
     */
    getPeriodFraction(period) {
        switch (period) {
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
     * Calculate carbon footprint status
     * 
     * @param {number} co2Impact - CO2 impact in tons
     * @returns {object} Status with color and message
     */
    getCarbonStatus(co2Impact) {
        if (co2Impact > 5) {
            return {
                color: '#2e7d32', // Deep green
                message: `Excelente: Absorvendo ${co2Impact.toFixed(2)} toneladas de CO₂`
            };
        } else if (co2Impact > 0) {
            return {
                color: '#4caf50', // Green
                message: `Positivo: Absorvendo ${co2Impact.toFixed(2)} toneladas de CO₂`
            };
        } else if (co2Impact === 0) {
            return {
                color: '#ffb300', // Amber
                message: 'Neutro: Impacto zero de carbono'
            };
        } else if (co2Impact > -5) {
            return {
                color: '#f57c00', // Orange
                message: `Negativo: Liberando ${Math.abs(co2Impact).toFixed(2)} toneladas de CO₂`
            };
        } else {
            return {
                color: '#c62828', // Deep red
                message: `Crítico: Liberando ${Math.abs(co2Impact).toFixed(2)} toneladas de CO₂`
            };
        }
    }
}