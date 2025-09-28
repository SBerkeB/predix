# Predix - Decentralized Prediction Market Platform

PrediX Algo runs on Algorand smart contracts that create markets for future events. Each market issues YES/NO tokens as Algorand Standard Assets (ASAs), which users can buy and sell through an automated market maker that adjusts prices based on supply and demand.

![Predix Logo](https://img.shields.io/badge/Predix-Prediction%20Market-00D4FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDBENEZGIi8+Cjwvc3ZnPgo=)

A modern, real-time prediction market platform built with Next.js and powered by Algorand blockchain smart contracts. Users can create predictions, place bets, and earn rewards based on accurate forecasting.
## 🌟 Features

### Core Functionality
- **📊 Prediction Markets**: Create and participate in prediction markets across various categories
- **💰 Betting System**: Place bets on prediction outcomes with real-time odds
- **🏆 Reward System**: Earn rewards for accurate predictions and successful bets
- **📱 Real-time Updates**: Live voting and prediction updates using WebSocket connections
- **🔗 Blockchain Integration**: Powered by Algorand smart contracts for transparent and secure betting

### Categories Supported
- 🚀 **Technology**: AI developments, tech company predictions, innovation forecasts
- 💎 **Cryptocurrency**: Price predictions, market movements, adoption forecasts
- ⚽ **Sports**: Game outcomes, championship predictions, player performance
- 🏛️ **Politics**: Election outcomes, policy predictions, political events
- 🎬 **Entertainment**: Award shows, box office predictions, celebrity events
- 🔬 **Science**: Research breakthroughs, space exploration, scientific discoveries
- 💼 **Economics**: Market predictions, economic indicators, business forecasts
- 🚗 **Automotive**: Industry developments, autonomous vehicle progress
- 🏥 **Health**: Medical breakthroughs, health trend predictions

### User Experience
- **🎨 Modern UI**: Clean, responsive design with dark theme and gradient accents
- **🔍 Search & Filter**: Advanced filtering by category, tags, and search terms
- **📊 Analytics**: Detailed voting statistics and prediction performance metrics
- **🎯 User Voting**: Track personal voting history and prediction accuracy
- **📱 Mobile Responsive**: Optimized for all device sizes

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4 with custom color palette
- **State Management**: React Context API with useReducer
- **Real-time Communication**: Socket.IO client for live updates
- **Components**: Modular component architecture with reusable UI elements

### Backend
- **Server**: Custom Node.js server with Next.js integration
- **WebSocket**: Socket.IO for real-time prediction and voting updates
- **Data Storage**: JSON-based data persistence for predictions and user votes
- **API Routes**: Next.js API routes for prediction management

### Blockchain Layer (Algorand)
- **Smart Contracts**: PyTeal-based prediction market contracts
- **Oracle Integration**: Price feeds and external data integration
- **Betting Mechanism**: Round-based betting with 10-block intervals
- **Asset Management**: Automatic ASA (Algorand Standard Asset) creation for receipts
- **Payout System**: Automated reward distribution based on outcomes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Algorand development environment (for blockchain features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SBerkeB/predix.git
   cd predix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open [http://localhost:3001](http://localhost:3001) in your browser

### Available Scripts

- `npm run dev` - Start development server with custom Socket.IO integration
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Algorand Configuration (for blockchain features)
ALGORAND_NODE_URL=your_algorand_node_url
ALGORAND_API_KEY=your_api_key
ORACLE_APP_ID=your_oracle_app_id
```

### Color Scheme
The application uses a custom X-inspired color palette:

- **Primary Colors**: Cyan (#00D4FF) and Purple (#8B5CF6)
- **Background**: Dark navy theme (#0F172A)
- **Text**: High contrast white and gray tones
- **Interactive**: Hover and active states with cyan accents

## 📊 Smart Contract Architecture

### Predix Contract (`predix.py`)
The main prediction market contract handles:

- **Round Management**: 10-block betting rounds with automatic progression
- **Betting Logic**: UP/DOWN predictions with proportional payouts
- **Oracle Integration**: External price feed integration for resolution
- **Asset Creation**: Automatic receipt token generation per round
- **Payout Distribution**: Proportional rewards based on winning predictions

### Key Contract Functions
- `bet_up` / `bet_down`: Place directional bets
- `resolve`: Resolve prediction outcomes using oracle data
- `claim`: Claim winnings from successful predictions

### Oracle System
- **Mock Oracle**: Development oracle for testing price feeds
- **Price Resolution**: Automatic outcome determination based on price movements
- **External Data**: Integration capability for real-world data sources

## 🎯 How It Works

### For Users
1. **Browse Predictions**: Explore active predictions across different categories
2. **Place Bets**: Vote on prediction outcomes and place blockchain-based bets
3. **Track Progress**: Monitor your predictions and voting history
4. **Earn Rewards**: Collect winnings from successful predictions
5. **Create Predictions**: Submit new predictions for community voting

### For Developers
1. **Component Structure**: Modular React components with clear separation of concerns
2. **State Management**: Centralized state with Context API and reducer pattern
3. **Real-time Updates**: WebSocket integration for live data synchronization
4. **Blockchain Integration**: Smart contract interaction for betting and rewards
5. **Data Persistence**: JSON-based storage with localStorage for user preferences

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features and hooks
- **Tailwind CSS 4**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Socket.IO**: WebSocket server implementation
- **Next.js API Routes**: Serverless API endpoints

### Blockchain
- **Algorand**: Layer-1 blockchain platform
- **PyTeal**: Python framework for Algorand smart contracts
- **ASA**: Algorand Standard Assets for receipts

### Development Tools
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization
- **Git**: Version control with GitHub integration

## 📈 Future Enhancements

### Planned Features
- **User Authentication**: Wallet-based authentication system
- **Advanced Analytics**: Detailed prediction performance metrics
- **Social Features**: User profiles, leaderboards, and social sharing
- **Mobile App**: Native mobile application development
- **Additional Oracles**: Integration with multiple data providers
- **Governance Token**: Platform governance and staking mechanisms

### Technical Improvements
- **Database Integration**: Migration from JSON to proper database
- **Caching Layer**: Redis integration for improved performance
- **API Documentation**: Comprehensive API documentation with Swagger
- **Testing Suite**: Unit and integration test coverage
- **CI/CD Pipeline**: Automated deployment and testing workflows

## 🤝 Contributing

We welcome contributions to Predix! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorand Foundation** for blockchain infrastructure
- **Next.js Team** for the excellent React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.IO** for real-time communication capabilities
- **Open Source Community** for inspiration and contributions

## 📞 Support

For support, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/SBerkeB/predix/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join our discussions in GitHub Discussions

---

**Built with ❤️ for the decentralized prediction market ecosystem**

*Predix - Where predictions meet blockchain technology*
