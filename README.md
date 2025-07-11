# CS2 Strategy Selector 🎮

A web application that generates random Counter-Strike 2 strategies and provides AI-powered tactical analysis using the Anthropic API.

![CS2 Strategy Selector](https://img.shields.io/badge/CS2-Strategy%20Selector-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![AI](https://img.shields.io/badge/AI-Anthropic%20Claude-orange)

## ✨ Features

- **🎯 Random Strategy Generation**: Get randomized strategies for any map, side, and round type
- **🤖 AI Strategy Analysis**: Detailed tactical analysis powered by OpenAI GPT, Anthropic Claude, or OpenRouter
- **🔍 Smart API Detection**: Automatically detects and uses the correct API based on your key format
- **🗺️ Multi-Map Support**: Supports all current CS2 competitive maps
- **💾 Local Storage**: API key persistence for convenience
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🚀 Fast & Lightweight**: Simple static files with minimal dependencies

## 🎮 Supported Maps

- Mirage (`de_mirage`)
- Nuke (`de_nuke`) 
- Ancient (`de_ancient`)
- Inferno (`de_inferno`)
- Dust2 (`de_dust2`)
- Anubis (`de_anubis`)
- Train (`de_train`)

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed on your system
- An API key from one of:
  - **OpenAI** (get one at [platform.openai.com](https://platform.openai.com))
  - **Anthropic** (get one at [console.anthropic.com](https://console.anthropic.com))
  - **OpenRouter** (get one at [openrouter.ai](https://openrouter.ai))

### Installation & Setup

1. **Clone or download this repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### How to Use

1. **Select your parameters:**
   - Choose your map
   - Select your side (CT/T)
   - Pick the round type (Pistol/Eco/Half Buy/Full Buy)

2. **Generate a strategy:**
   - Click "Generate Strategy" to get a random strategy

3. **Get AI analysis (optional):**
   - Click "🤖 Optional: AI Strategy Analysis" to expand the section
   - Enter your OpenAI, Anthropic, or OpenRouter API key
   - Click "Analyze Strategy with AI"
   - Review the detailed tactical analysis

## 🤖 AI Integration

The application supports multiple AI providers with automatic detection:

### Supported AI Models
- **OpenAI**: GPT-3.5 Turbo (fast and cost-effective)
- **Anthropic**: Claude 3 Haiku (fast and cost-effective)
- **OpenRouter**: Claude 3 Haiku via OpenRouter (access to multiple models)

### API Key Detection
- **OpenAI keys**: Start with `sk-` (e.g., `sk-proj-...`)
- **Anthropic keys**: Start with `sk-ant-` (e.g., `sk-ant-...`)
- **OpenRouter keys**: Start with `sk-or-` (e.g., `sk-or-...`)

The app automatically detects your key format and calls the appropriate API.

### API Integration Details
- **OpenAI Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Anthropic Endpoint**: `https://api.anthropic.com/v1/messages`
- **OpenRouter Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Authentication**: API key required for any service
- **Privacy**: API key stored locally in browser

## 🛡️ Security & Privacy

- **API Key Security**: Your API key is stored locally in your browser and never sent anywhere except directly to your chosen AI provider's API
- **No Backend Storage**: No user data is stored on any server
- **Client-Side Only**: All processing happens in your browser
- **HTTPS**: All API calls to OpenAI, Anthropic, and OpenRouter use HTTPS encryption
- **Auto-Detection**: The app automatically determines which API to use based on your key format

## 🔧 Development

### Project Structure

```
cs2igl/
├── index.html          # Main HTML file
├── index.js            # JavaScript functionality
├── server.js           # Express.js server
├── package.json        # Node.js dependencies
├── README.md           # This file
└── strategies/         # Strategy data files
    ├── de_ancient.1.json
    ├── de_anubis.1.json
    ├── de_dust2.1.json
    ├── de_inferno.1.json
    ├── de_mirage.1.json
    ├── de_nuke.1.json
    ├── de_train.1.json
    └── maps_descriptions.json
```

### Running in Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Or start with Node.js directly
node server.js
```

## 🎯 Strategy Categories

### Round Types
- **Pistol Round**: Starting round strategies
- **Eco Round**: Low-economy strategies  
- **Half Buy**: Limited equipment strategies
- **Full Buy**: Full equipment strategies

### Analysis Includes
- **Strengths**: What makes the strategy effective
- **Weaknesses**: Potential vulnerabilities
- **Key Execution Points**: Critical success factors
- **Counter-Strategies**: How opponents might respond
- **Alternative Approaches**: Other viable strategies

## 📝 Contributing

Feel free to contribute by:
- Adding new strategies to the JSON files
- Improving the UI/UX
- Adding new maps
- Enhancing the AI analysis prompts

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🎮 Enjoy Your Games!

Good luck on your CS2 matches! May your strategies be solid and your aim be true. 🎯

---

*Created for the CS2 community with ❤️*
