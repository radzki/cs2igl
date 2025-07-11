// Strategy selector functionality
class StrategySelector {
    constructor() {
        this.strategies = {};
        this.mapDescriptions = {};
        this.currentStrategy = null;
        this.currentContext = null;
        this.initializeEventListeners();
        this.loadMapDescriptions();
    }

    initializeEventListeners() {
        const generateBtn = document.getElementById('generate-btn');
        const generateAnalyzeBtn = document.getElementById('generate-analyze-btn');
        const mapSelector = document.getElementById('map-selector');
        const sideSelector = document.getElementById('side-selector');
        const statusSelector = document.getElementById('status-selector');
        const apiKeyInput = document.getElementById('api-key-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const optionalToggle = document.getElementById('optional-toggle');

        generateBtn.addEventListener('click', () => this.generateStrategy());
        generateAnalyzeBtn.addEventListener('click', () => this.generateStrategyAndAnalyze());
        analyzeBtn.addEventListener('click', () => this.analyzeStrategy());
        optionalToggle.addEventListener('click', () => this.toggleOptionalSection());
        
        // Enable/disable buttons based on selections
        [mapSelector, sideSelector, statusSelector].forEach(selector => {
            selector.addEventListener('change', () => this.validateSelections());
        });

        // Enable/disable analyze button based on API key
        apiKeyInput.addEventListener('input', () => this.validateApiKey());
        
        // Enable/disable generate+analyze button based on API key
        apiKeyInput.addEventListener('input', () => this.validateSelections());
        
        // Store API key in localStorage
        apiKeyInput.addEventListener('input', () => {
            localStorage.setItem('ai_api_key', apiKeyInput.value);
        });

        // Load API key from localStorage on page load
        const savedApiKey = localStorage.getItem('ai_api_key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            this.validateApiKey();
            this.validateSelections();
        }

        // Initialize button state
        this.validateSelections();
    }

    toggleOptionalSection() {
        const optionalToggle = document.getElementById('optional-toggle');
        const optionalContent = document.getElementById('optional-content');
        
        optionalToggle.classList.toggle('active');
        optionalContent.classList.toggle('show');
    }

    validateSelections() {
        const mapValue = document.getElementById('map-selector').value;
        const sideValue = document.getElementById('side-selector').value;
        const statusValue = document.getElementById('status-selector').value;
        const apiKeyValue = document.getElementById('api-key-input').value.trim();
        const generateBtn = document.getElementById('generate-btn');
        const generateAnalyzeBtn = document.getElementById('generate-analyze-btn');

        // Enable/disable regular generate button
        if (mapValue && sideValue && statusValue) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        } else {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.6';
            generateBtn.style.cursor = 'not-allowed';
        }

        // Enable/disable generate+analyze button (needs all selections + API key)
        if (mapValue && sideValue && statusValue && apiKeyValue) {
            generateAnalyzeBtn.disabled = false;
            generateAnalyzeBtn.style.opacity = '1';
            generateAnalyzeBtn.style.cursor = 'pointer';
        } else {
            generateAnalyzeBtn.disabled = true;
            generateAnalyzeBtn.style.opacity = '0.6';
            generateAnalyzeBtn.style.cursor = 'not-allowed';
        }
    }

    validateApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const analyzeBtn = document.getElementById('analyze-btn');
        const apiKey = apiKeyInput.value.trim();

        if (apiKey && this.currentStrategy) {
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = '1';
            analyzeBtn.style.cursor = 'pointer';
        } else {
            analyzeBtn.disabled = true;
            analyzeBtn.style.opacity = '0.6';
            analyzeBtn.style.cursor = 'not-allowed';
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

    getRandomStrategy(strategiesData, side, status) {
        // Check if the side exists in the data
        if (!strategiesData[side]) {
            throw new Error(`No strategies found for side: ${side}`);
        }

        // Check if the status exists for this side
        if (!strategiesData[side][status] || strategiesData[side][status].length === 0) {
            throw new Error(`No strategies found for ${side} ${status}`);
        }

        const strategies = strategiesData[side][status];
        const randomIndex = Math.floor(Math.random() * strategies.length);
        return strategies[randomIndex];
    }

    async generateStrategy() {
        const mapSelector = document.getElementById('map-selector');
        const sideSelector = document.getElementById('side-selector');
        const statusSelector = document.getElementById('status-selector');
        const strategyDisplay = document.getElementById('strategy-display');
        const strategyContent = document.getElementById('strategy-content');
        const strategyMap = document.getElementById('strategy-map');
        const strategyStatus = document.getElementById('strategy-status');

        const selectedMap = mapSelector.value;
        const selectedSide = sideSelector.value;
        const selectedStatus = statusSelector.value;

        if (!selectedMap || !selectedSide || !selectedStatus) {
            this.showError('Please select map, side, and round status');
            return;
        }

        try {
            // Show loading state
            this.showLoading();

            // Load strategies for the selected map
            const strategiesData = await this.loadStrategies(selectedMap);

            // Get random strategy
            const randomStrategy = this.getRandomStrategy(strategiesData, selectedSide, selectedStatus);

            // Store current strategy and context for AI analysis
            this.currentStrategy = randomStrategy.strategy;
            this.currentContext = {
                map: selectedMap,
                side: selectedSide,
                status: selectedStatus
            };

            // Display the strategy
            this.displayStrategy(selectedMap, selectedSide, selectedStatus, randomStrategy.strategy);

            // Display key points (they appear last if no AI analysis)
            this.displayKeyPoints(selectedMap);

            // Revalidate API key (in case strategy wasn't available before)
            this.validateApiKey();

        } catch (error) {
            console.error('Error generating strategy:', error);
            this.showError('Failed to load strategy. Please try again.');
        }
    }

    async generateStrategyAndAnalyze() {
        const mapSelector = document.getElementById('map-selector');
        const sideSelector = document.getElementById('side-selector');
        const statusSelector = document.getElementById('status-selector');
        const apiKeyInput = document.getElementById('api-key-input');

        const selectedMap = mapSelector.value;
        const selectedSide = sideSelector.value;
        const selectedStatus = statusSelector.value;
        const apiKey = apiKeyInput.value.trim();

        if (!selectedMap || !selectedSide || !selectedStatus) {
            this.showError('Please select map, side, and round status');
            return;
        }

        if (!apiKey) {
            this.showAnalysisError('Please enter your API key');
            return;
        }

        try {
            // First, generate the strategy
            this.showLoading();

            // Load strategies for the selected map
            const strategiesData = await this.loadStrategies(selectedMap);

            // Get random strategy
            const randomStrategy = this.getRandomStrategy(strategiesData, selectedSide, selectedStatus);

            // Store current strategy and context for AI analysis
            this.currentStrategy = randomStrategy.strategy;
            this.currentContext = {
                map: selectedMap,
                side: selectedSide,
                status: selectedStatus
            };

            // Display the strategy
            this.displayStrategy(selectedMap, selectedSide, selectedStatus, randomStrategy.strategy);

            // Now run the AI analysis
            await this.runAnalysis(apiKey);

        } catch (error) {
            console.error('Error generating strategy and analysis:', error);
            this.showError('Failed to generate strategy and analysis. Please try again.');
        }
    }

    async runAnalysis(apiKey) {
        if (!this.currentStrategy || !this.currentContext) {
            this.showAnalysisError('No strategy available for analysis');
            return;
        }

        try {
            // Show loading state for analysis
            this.showAnalysisLoading();

            // Detect API provider and prepare the analysis prompt
            const apiProvider = this.detectApiProvider(apiKey);
            const prompt = this.buildAnalysisPrompt();

            // Call the appropriate API
            let analysis;
            if (apiProvider === 'anthropic') {
                analysis = await this.callAnthropicAPI(apiKey, prompt);
            } else if (apiProvider === 'openai') {
                analysis = await this.callOpenAIAPI(apiKey, prompt);
            } else if (apiProvider === 'openrouter') {
                analysis = await this.callOpenRouterAPI(apiKey, prompt);
            } else {
                throw new Error('Unsupported API key format. Please use OpenAI (sk-...), Anthropic (sk-ant-...), or OpenRouter (sk-or-...) API keys.');
            }

            // Display the analysis
            this.displayAnalysis(analysis);

        } catch (error) {
            console.error('Error analyzing strategy:', error);
            this.showAnalysisError('Failed to analyze strategy. Please check your API key and try again.');
        }
    }

    displayStrategy(mapName, side, status, strategy) {
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
        strategyStatus.textContent = `${side} - ${displayStatus}`;
        
        // Build the content with only the strategy section
        let content = `<div class="strategy-section">
            <h3>${side} Strategy:</h3>
            <div class="strategy-text">${this.formatStrategy(strategy)}</div>
        </div>`;

        strategyContent.innerHTML = content;

        // Show the strategy display with animation
        strategyDisplay.classList.remove('show');
        setTimeout(() => {
            strategyDisplay.classList.add('show');
        }, 100);
    }

    displayKeyPoints(mapName) {
        const keyPointsDisplay = document.getElementById('key-points');
        const keyPointsContent = document.getElementById('key-points-content');
        const keyPointsTitle = document.getElementById('key-points-title');

        // Format map name for display
        const displayMapName = mapName.replace('de_', '').charAt(0).toUpperCase() + 
                              mapName.replace('de_', '').slice(1);

        // Update title
        keyPointsTitle.textContent = `Key Points for ${displayMapName}`;

        // Add key points if available
        if (this.mapDescriptions[mapName]) {
            const content = `<div class="key-points-text">${this.formatStrategy(this.mapDescriptions[mapName])}</div>`;
            keyPointsContent.innerHTML = content;

            // Show the key points display with animation
            keyPointsDisplay.classList.remove('show');
            setTimeout(() => {
                keyPointsDisplay.classList.add('show');
            }, 100);
        } else {
            // Hide key points if no description available
            keyPointsDisplay.classList.remove('show');
        }
    }

    async analyzeStrategy() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.showAnalysisError('Please enter your API key');
            return;
        }

        if (!this.currentStrategy || !this.currentContext) {
            this.showAnalysisError('Please generate a strategy first');
            return;
        }

        try {
            // Show loading state
            this.showAnalysisLoading();

            // Detect API provider and prepare the analysis prompt
            const apiProvider = this.detectApiProvider(apiKey);
            const prompt = this.buildAnalysisPrompt();

            // Call the appropriate API
            let analysis;
            if (apiProvider === 'anthropic') {
                analysis = await this.callAnthropicAPI(apiKey, prompt);
            } else if (apiProvider === 'openai') {
                analysis = await this.callOpenAIAPI(apiKey, prompt);
            } else if (apiProvider === 'openrouter') {
                analysis = await this.callOpenRouterAPI(apiKey, prompt);
            } else {
                throw new Error('Unsupported API key format. Please use OpenAI (sk-...), Anthropic (sk-ant-...), or OpenRouter (sk-or-...) API keys.');
            }

            // Display the analysis
            this.displayAnalysis(analysis);

        } catch (error) {
            console.error('Error analyzing strategy:', error);
            this.showAnalysisError('Failed to analyze strategy. Please check your API key and try again.');
        }
    }

    detectApiProvider(apiKey) {
        if (apiKey.startsWith('sk-ant-')) {
            return 'anthropic';
        } else if (apiKey.startsWith('sk-or-')) {
            return 'openrouter';
        } else if (apiKey.startsWith('sk-')) {
            return 'openai';
        } else {
            return 'unknown';
        }
    }

    buildAnalysisPrompt() {
        const mapName = this.currentContext.map.replace('de_', '').charAt(0).toUpperCase() + 
                      this.currentContext.map.replace('de_', '').slice(1);
        const side = this.currentContext.side;
        const status = this.currentContext.status.replace('_', ' ');

        return `As a professional CS2 analyst, analyze this Counter-Strike 2 strategy:

Map: ${mapName}
Side: ${side}
Round Type: ${status}
Strategy: ${this.currentStrategy}

Please think about the following points:
1. **Strengths** - What makes this strategy effective?
2. **Weaknesses** - What are the potential vulnerabilities?
3. **Key Execution Points** - What are the critical factors for success?
4. **Counter-Strategies** - How might opponents respond?
5. **Alternative Approaches** - What other strategies could work in this situation?

Keep your analysis practical and tactical, focusing on in-game execution and team coordination.

Limit your analysis to at most 2 paragraphs.

Dont return text such as "Certainly! ..." Or "Sure, here it is". Just return the analysis.

ALSO: Make sure that the strategy is not TOO illogical or unrealistic, nor IMPOSSIBLE, such as impossible smoke angles or things like that.`;
    }

    async callAnthropicAPI(apiKey, prompt) {
        const requestBody = {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        console.log('Anthropic API Request:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API Error Response:', errorText);
            console.error('Status:', response.status);
            console.error('Headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.status === 401) {
                throw new Error('Invalid Anthropic API key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status === 400) {
                throw new Error(`Anthropic API error: Bad request. Check console for details.`);
            } else {
                throw new Error(`Anthropic API request failed with status ${response.status}: ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('Anthropic API Success Response:', data);
        return data.content[0].text;
    }

    async callOpenAIAPI(apiKey, prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status === 400) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || 'Bad request'}`);
            } else {
                throw new Error(`OpenAI API request failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callOpenRouterAPI(apiKey, prompt) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'CS2 Strategy Selector'
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-haiku',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid OpenRouter API key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else if (response.status === 400) {
                const errorData = await response.json();
                throw new Error(`OpenRouter API error: ${errorData.error?.message || 'Bad request'}`);
            } else {
                throw new Error(`OpenRouter API request failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    displayAnalysis(analysis) {
        const aiAnalysis = document.getElementById('ai-analysis');
        const analysisContent = document.getElementById('analysis-content');

        // Format the analysis text
        const formattedAnalysis = this.formatAnalysis(analysis);
        analysisContent.innerHTML = formattedAnalysis;

        // Show the analysis with animation
        aiAnalysis.classList.remove('show');
        setTimeout(() => {
            aiAnalysis.classList.add('show');
            // Display key points after AI analysis (they appear last)
            if (this.currentContext && this.currentContext.map) {
                this.displayKeyPoints(this.currentContext.map);
            }
        }, 100);
    }

    formatAnalysis(analysis) {
        // Convert markdown-style formatting to HTML
        return analysis
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    showAnalysisLoading() {
        const aiAnalysis = document.getElementById('ai-analysis');
        const analysisContent = document.getElementById('analysis-content');

        analysisContent.innerHTML = '<div class="loading">🤖 AI is analyzing your strategy...</div>';
        aiAnalysis.classList.add('show');
    }

    showAnalysisError(message) {
        const aiAnalysis = document.getElementById('ai-analysis');
        const analysisContent = document.getElementById('analysis-content');

        analysisContent.innerHTML = `<div class="error">⚠️ ${message}</div>`;
        aiAnalysis.classList.add('show');
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
        const keyPointsDisplay = document.getElementById('key-points');

        strategyMap.textContent = 'Loading...';
        strategyStatus.textContent = '';
        strategyContent.innerHTML = '<div class="loading">Generating strategy...</div>';

        strategyDisplay.classList.add('show');
        
        // Hide key points and AI analysis during loading
        keyPointsDisplay.classList.remove('show');
        const aiAnalysis = document.getElementById('ai-analysis');
        aiAnalysis.classList.remove('show');
    }

    showError(message) {
        const strategyDisplay = document.getElementById('strategy-display');
        const strategyContent = document.getElementById('strategy-content');
        const strategyMap = document.getElementById('strategy-map');
        const strategyStatus = document.getElementById('strategy-status');
        const keyPointsDisplay = document.getElementById('key-points');

        strategyMap.textContent = 'Error';
        strategyStatus.textContent = '';
        strategyContent.innerHTML = `<div class="error">${message}</div>`;

        strategyDisplay.classList.add('show');
        
        // Hide key points and AI analysis during error
        keyPointsDisplay.classList.remove('show');
        const aiAnalysis = document.getElementById('ai-analysis');
        aiAnalysis.classList.remove('show');
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
