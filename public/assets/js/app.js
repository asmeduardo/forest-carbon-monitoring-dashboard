/**
 * Main application JavaScript
 */

// Import modules
import { AuthService } from './auth.js';
import { ForestChartService } from './chart.js';
import { ForestSceneService } from './forest-scene.js';
import { CarbonCalculator } from './carbon-calculator.js';

// Main Application Class
export default class App {
    constructor() {
        // Services
        this.auth = new AuthService();
        this.forestScene = new ForestSceneService();
        this.chart = new ForestChartService();
        this.carbonCalculator = new CarbonCalculator();
        
        // Current state
        this.forestData = [];
        this.currentPeriod = 'day';
        
        // DOM elements
        this.elements = {
            stats: {
                plantedValue: document.getElementById('plantedValue'),
                cutValue: document.getElementById('cutValue'),
                balanceValue: document.getElementById('balanceValue'),
                co2Value: document.getElementById('co2Value'),
                co2MeterFill: document.getElementById('co2MeterFill'),
                co2Status: document.getElementById('co2Status')
            },
            form: {
                forestDataForm: document.getElementById('forestDataForm'),
                dataEntry: document.querySelector('.data-entry'),
                dateInput: document.getElementById('date'),
                actionSelect: document.getElementById('action'),
                quantityInput: document.getElementById('quantity'),
                co2Estimate: document.getElementById('co2Estimate')
            },
            timePeriodButtons: document.querySelectorAll('.time-btn')
        };
        
        // Initialize application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        // Initialize UI components
        this.forestScene.createClouds();
        this.forestScene.animateFloatingIsland();
        
        // Initialize chart
        this.chart.initializeChart();
        
        // Load initial data
        await this.loadData();
        
        // Update UI
        this.updateUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check authentication status
        this.checkAuth();
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Verificar se os elementos existem antes de adicionar listeners
        if (this.elements.timePeriodButtons) {
            this.elements.timePeriodButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.elements.timePeriodButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentPeriod = btn.dataset.period;
                    this.updateChart();
                    this.updateStats();
                });
            });
        }
        
        // Forest data form
        if (this.elements.form.forestDataForm) {
            this.elements.form.forestDataForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // CO2 estimate update
        if (this.elements.form.actionSelect && this.elements.form.quantityInput) {
            this.elements.form.actionSelect.addEventListener('change', this.updateCO2Estimate.bind(this));
            this.elements.form.quantityInput.addEventListener('input', this.updateCO2Estimate.bind(this));
        }
    }
    
    /**
     * Load forest data from API
     */
    async loadData() {
        try {
            const response = await fetch('/api/forest/data');
            this.forestData = await response.json();
            console.log('Data loaded:', this.forestData);
        } catch (error) {
            console.error('Error loading data:', error);
            this.forestData = [];
        }
    }
    
    /**
     * Update UI components
     */
    updateUI() {
        this.updateChart();
        this.updateStats();
        this.forestScene.updateForestScene(this.forestData);
    }
    
    /**
     * Update chart based on current period
     */
    updateChart() {
        this.chart.updateChart(this.forestData, this.currentPeriod);
    }
    
    /**
     * Update statistics based on current period
     */
    async updateStats() {
        try {
            const response = await fetch(`/api/forest/carbon?period=${this.currentPeriod}`);
            const stats = await response.json();
            
            // Update stats display
            this.elements.stats.plantedValue.textContent = stats.planted;
            this.elements.stats.cutValue.textContent = stats.cut;
            this.elements.stats.balanceValue.textContent = stats.balance;
            this.elements.stats.co2Value.textContent = stats.co2_impact.toFixed(2);
            
            // Update CO2 meter
            this.updateCO2Meter(stats.co2_impact);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
    
    /**
     * Update CO2 meter
     */
    updateCO2Meter(co2Impact) {
        // The scale goes from -10 to +10 tons
        const maxRange = 10;
        const percentage = ((parseFloat(co2Impact) + maxRange) / (maxRange * 2)) * 100;
        
        // Limit between 0 and 100%
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        this.elements.stats.co2MeterFill.style.width = clampedPercentage + '%';
        
        // Set color based on impact
        if (co2Impact > 0) {
            this.elements.stats.co2MeterFill.style.background = 'linear-gradient(to right, #ffeb3b, #4caf50)';
            this.elements.stats.co2Status.textContent = `Positivo: Absorvendo ${Math.abs(co2Impact).toFixed(2)} toneladas de CO₂`;
            this.elements.stats.co2Status.style.color = '#2e7d32';
        } else if (co2Impact < 0) {
            this.elements.stats.co2MeterFill.style.background = 'linear-gradient(to right, #f44336, #ffeb3b)';
            this.elements.stats.co2Status.textContent = `Negativo: Liberando ${Math.abs(co2Impact).toFixed(2)} toneladas de CO₂`;
            this.elements.stats.co2Status.style.color = '#c62828';
        } else {
            this.elements.stats.co2MeterFill.style.background = '#ffeb3b';
            this.elements.stats.co2Status.textContent = 'Impacto neutro de carbono';
            this.elements.stats.co2Status.style.color = '#f57f17';
        }
    }
    
    /**
     * Update CO2 estimate for form
     */
    updateCO2Estimate() {
        const action = this.elements.form.actionSelect.value;
        const quantity = parseInt(this.elements.form.quantityInput.value) || 0;
        
        let co2Impact = 0;
        
        if (action === 'planted') {
            co2Impact = this.carbonCalculator.calculatePlantedImpact(quantity);
            this.elements.form.co2Estimate.textContent = `+${co2Impact.toFixed(1)} kg de CO₂ absorvidos por ano`;
            this.elements.form.co2Estimate.style.color = '#2e7d32';
        } else {
            co2Impact = this.carbonCalculator.calculateCutImpact(quantity);
            this.elements.form.co2Estimate.textContent = `${co2Impact.toFixed(1)} kg de CO₂ liberados`;
            this.elements.form.co2Estimate.style.color = '#c62828';
        }
    }
    
    /**
     * Handle form submission
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = {
            date: this.elements.form.dateInput.value,
            action: this.elements.form.actionSelect.value,
            quantity: parseInt(this.elements.form.quantityInput.value),
        };
        
        try {
            const response = await fetch('/api/forest/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.auth.getToken()}`
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Dados cadastrados com sucesso!');
                this.elements.form.forestDataForm.reset();
                
                // Reload data and update UI
                await this.loadData();
                this.updateUI();
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Erro ao enviar dados. Tente novamente.');
        }
    }
    
    /**
     * Check authentication status
     */
    checkAuth() {
        const isLoggedIn = this.auth.isAuthenticated();
        
        if (isLoggedIn) {
            const username = this.auth.getUsername();
            this.auth.toggleLoginUI(true, username);
        } else {
            this.auth.toggleLoginUI(false);
        }
    }
}