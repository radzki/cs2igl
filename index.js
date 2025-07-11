// Strategy selector functionality
class StrategySelector {
    constructor() {
        this.strategies = {};
        this.mapDescriptions = {};
        this.initializeEventListeners();
        this.loadMapDescriptions();
    }

    initializeEventListeners() {
        const generateBtn = document.getElementById('generate-btn');
        const mapSelector = document.getElementById('map-selector');
        const statusSelector = document.getElementById('status-selector');

        generateBtn.addEventListener('click', () => this.generateStrategy());
        
        // Enable/disable generate button based on selections
        [mapSelector, statusSelector].forEach(selector => {
            selector.addEventListener('change', () => this.validateSelections());
        });

        // Initialize button state
        this.validateSelections();
    }

    validateSelections() {
        const mapValue = document.getElementById('map-selector').value;
        const statusValue = document.getElementById('status-selector').value;
        const generateBtn = document.getElementById('generate-btn');

        if (mapValue && statusValue) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        } else {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.6';
            generateBtn.style.cursor = 'not-allowed';
        }
    }

    async loadMapDescriptions() {
        try {
            const response = await fetch(`strategies/maps_descriptions.json?v=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error('Failed to load map descriptions');
            }

            const data = await response.json();
            this.mapDescriptions = data;
        } catch (error) {
            console.error('Error loading map descriptions:', error);
            // Continue without descriptions if they fail to load
        }
    }

    async loadStrategies(mapName) {
        if (this.strategies[mapName]) {
            return this.strategies[mapName];
        }

        try {
            const response = await fetch(`strategies/${mapName}.1.json?v=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load strategies for ${mapName}`);
            }

            const data = await response.json();
            this.strategies[mapName] = data;
            return data;
        } catch (error) {
            console.error('Error loading strategies:', error);
            throw error;
        }
    }

    getRandomStrategy(strategiesData, status) {
        // Find the status object in the array
        const statusObj = strategiesData.find(item => item[status]);
        
        if (!statusObj || !statusObj[status] || statusObj[status].length === 0) {
            throw new Error(`No strategies found for status: ${status}`);
        }

        const strategies = statusObj[status];
        const randomIndex = Math.floor(Math.random() * strategies.length);
        return strategies[randomIndex];
    }

    async generateStrategy() {
        const mapSelector = document.getElementById('map-selector');
        const statusSelector = document.getElementById('status-selector');
        const strategyDisplay = document.getElementById('strategy-display');
        const strategyContent = document.getElementById('strategy-content');
        const strategyMap = document.getElementById('strategy-map');
        const strategyStatus = document.getElementById('strategy-status');

        const selectedMap = mapSelector.value;
        const selectedStatus = statusSelector.value;

        if (!selectedMap || !selectedStatus) {
            this.showError('Please select both a map and round status');
            return;
        }

        try {
            // Show loading state
            this.showLoading();

            // Load strategies for the selected map
            const strategiesData = await this.loadStrategies(selectedMap);

            // Get random strategy
            const randomStrategy = this.getRandomStrategy(strategiesData, selectedStatus);

            // Display the strategy
            this.displayStrategy(selectedMap, selectedStatus, randomStrategy.strategy);

        } catch (error) {
            console.error('Error generating strategy:', error);
            this.showError('Failed to load strategy. Please try again.');
        }
    }

    displayStrategy(mapName, status, strategy) {
        const strategyDisplay = document.getElementById('strategy-display');
        const strategyContent = document.getElementById('strategy-content');
        const strategyMap = document.getElementById('strategy-map');
        const strategyStatus = document.getElementById('strategy-status');

        // Format map name for display
        const displayMapName = mapName.replace('de_', '').charAt(0).toUpperCase() + 
                              mapName.replace('de_', '').slice(1);

        // Format status for display
        const displayStatus = status.replace('_', ' ');

        // Update content
        strategyMap.textContent = displayMapName;
        strategyStatus.textContent = displayStatus;
        
        // Build the content with strategy and key points
        let content = `<div class="strategy-section">
            <h3>Strategy:</h3>
            <div class="strategy-text">${this.formatStrategy(strategy)}</div>
        </div>`;

        // Add key points if available
        if (this.mapDescriptions[mapName]) {
            content += `<div class="key-points-section">
                <h3>Key Points for ${displayMapName}:</h3>
                <div class="key-points-text">${this.formatStrategy(this.mapDescriptions[mapName])}</div>
            </div>`;
        }

        strategyContent.innerHTML = content;

        // Show the strategy display with animation
        strategyDisplay.classList.remove('show');
        setTimeout(() => {
            strategyDisplay.classList.add('show');
        }, 100);
    }

    formatStrategy(strategy) {
        // Convert markdown-style formatting to HTML
        return strategy
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    showLoading() {
        const strategyDisplay = document.getElementById('strategy-display');
        const strategyContent = document.getElementById('strategy-content');
        const strategyMap = document.getElementById('strategy-map');
        const strategyStatus = document.getElementById('strategy-status');

        strategyMap.textContent = 'Loading...';
        strategyStatus.textContent = '';
        strategyContent.innerHTML = '<div class="loading">Generating strategy...</div>';

        strategyDisplay.classList.add('show');
    }

    showError(message) {
        const strategyDisplay = document.getElementById('strategy-display');
        const strategyContent = document.getElementById('strategy-content');
        const strategyMap = document.getElementById('strategy-map');
        const strategyStatus = document.getElementById('strategy-status');

        strategyMap.textContent = 'Error';
        strategyStatus.textContent = '';
        strategyContent.innerHTML = `<div class="error">${message}</div>`;

        strategyDisplay.classList.add('show');
    }
}

// Initialize the strategy selector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StrategySelector();
});

// Add some keyboard shortcuts for better UX
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const generateBtn = document.getElementById('generate-btn');
        if (!generateBtn.disabled) {
            generateBtn.click();
        }
    }
});
