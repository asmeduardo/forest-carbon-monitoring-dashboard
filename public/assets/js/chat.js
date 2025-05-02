/**
 * Forest Chart Service
 * Handles chart visualization
 */
export class ForestChartService {
    constructor() {
        this.chart = null;
        this.chartElement = document.getElementById('forestChart');
    }
    
    /**
     * Initialize the chart
     */
    initializeChart() {
        if (!this.chartElement) {
            console.error('Chart element not found');
            return;
        }
        
        const ctx = this.chartElement.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Árvores Plantadas',
                        backgroundColor: '#4caf50',
                        data: [],
                    },
                    {
                        label: 'Árvores Suprimidas',
                        backgroundColor: '#ff9800',
                        data: [],
                    },
                    {
                        label: 'Pegada de CO₂ (ton)',
                        type: 'line',
                        borderColor: '#009688',
                        backgroundColor: 'rgba(0, 150, 136, 0.2)',
                        fill: true,
                        data: [],
                        yAxisID: 'co2',
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Data',
                        },
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade',
                        },
                    },
                    co2: {
                        position: 'right',
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'CO₂ (toneladas)',
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                },
            },
        });
    }
    
    /**
     * Update chart with new data and period
     */
    async updateChart(forestData, period = 'day') {
        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }
        
        try {
            // Fetch period data from API
            const response = await fetch(`/api/forest/stats?period=${period}`);
            const periodData = await response.json();
            
            const labels = [];
            const plantedData = [];
            const cutData = [];
            const co2Data = [];
            
            // Process data
            periodData.forEach(item => {
                labels.push(this.formatPeriodLabel(item.period, period));
                plantedData.push(item.planted);
                cutData.push(item.cut);
                co2Data.push(item.co2_impact);
            });
            
            // Update chart data
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = plantedData;
            this.chart.data.datasets[1].data = cutData;
            this.chart.data.datasets[2].data = co2Data;
            
            // Update chart
            this.chart.update();
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }
    
    /**
     * Format period label based on period type
     */
    formatPeriodLabel(period, periodType) {
        switch (periodType) {
            case 'day':
                // Format: "YYYY-MM-DD" -> "DD/MM"
                const dateParts = period.split('-');
                return `${dateParts[2]}/${dateParts[1]}`;
                
            case 'week':
                // Format: "YYYY-WXX" -> "Semana XX"
                return period.replace(/(\d+)-W(\d+)/, 'Sem $2');
                
            case 'month':
                // Format: "YYYY-MM" -> "MM/YYYY"
                const [year, month] = period.split('-');
                const monthNames = [
                    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                ];
                return `${monthNames[parseInt(month) - 1]}/${year}`;
                
            case 'year':
                // Format: "YYYY" -> "YYYY"
                return period;
                
            default:
                return period;
        }
    }
    
    /**
     * Destroy the chart instance
     */
    destroyChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}