const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to set CORS headers (needed for Anthropic API calls)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, anthropic-version');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all handler for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log('🚀 CS2 Strategy Selector Server Started!');
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`🎮 Open your browser and navigate to the URL above`);
    console.log(`⚡ Press Ctrl+C to stop the server`);
    console.log('');
    console.log('Features available:');
    console.log('• 🎯 Generate random CS2 strategies');
    console.log('• 🤖 AI strategy analysis (OpenAI, Anthropic, OpenRouter)');
    console.log('• ⚡ Generate + AI analysis in one click');
    console.log('• 💾 Local API key storage');
    console.log('• 📱 Responsive design');
}); 