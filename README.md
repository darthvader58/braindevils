# BrainDevils - Fine Motor Skills (FMS) Training Games

A modern, professional brain training platform featuring three engaging games: Origami Master, Speed Typing, and Memory Challenge. Built with vanilla JavaScript, Node.js, Express, and MongoDB with Google OAuth integration.

## Features

- **Clean, Professional UI**: Simplified design inspired by modern web applications
- **Google OAuth Authentication**: Secure login with Google accounts
- **Progress Tracking**: MongoDB integration to track user progress and statistics
- **Three Engaging Games**:
  - **Origami Master**: Realistic origami folding patterns with traditional techniques
  - **Speed Typing**: Typing speed and accuracy challenges
  - **Memory Challenge**: Pattern recognition and working memory training
- **Difficulty Levels**: Easy, Medium, and Hard for each game
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Statistics**: Track WPM, accuracy, scores, and improvement over time
- **Leaderboards**: Compete with other players

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth 2.0
- **Security**: Helmet, CORS, Rate limiting
- **Development**: Nodemon, Concurrently, Live-server

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd braindevils-games
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/braindevils
   JWT_SECRET=your-super-secret-jwt-key-here
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   CLIENT_URL=http://localhost:3001
   ```

4. **Google OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized origins: `http://localhost:3001`
   - Update `GOOGLE_CLIENT_ID` in `.env`
   - Update the client ID in `public/js/app.js`

5. **Start the application**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:3000`
   - Frontend server on `http://localhost:3001`

## Game Details

### Origami Master
- **Realistic Folding Patterns**: Based on traditional origami techniques
- **Progressive Difficulty**: From simple 4-step patterns to complex 8-step designs
- **Visual Feedback**: Interactive fold lines with proper valley/mountain fold notation
- **Traditional Patterns**: Includes classic designs like cranes, boats, and roses
- **Scoring**: Based on accuracy, speed, and completion

### Speed Typing
- **Adaptive Word Lists**: Difficulty-appropriate vocabulary
- **Real-time Feedback**: Immediate visual feedback on typing accuracy
- **Performance Metrics**: WPM, accuracy percentage, error tracking
- **Time Challenges**: 60-120 second typing sessions
- **Progress Tracking**: Best scores and improvement over time

### Memory Challenge
- **Grid-based Patterns**: 2x2 to 4x4 grids based on difficulty
- **Shape Recognition**: Four distinct shapes with number associations
- **Timed Phases**: Separate memorization and recall periods
- **Accuracy Scoring**: Points for correct pattern reproduction
- **Progressive Difficulty**: Shorter memory time, larger grids

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/user/profile` - Get user profile

### Game Data
- `POST /api/game/session` - Save game session
- `GET /api/game/history/:gameType?` - Get game history
- `GET /api/leaderboard/:gameType` - Get leaderboards

### Utility
- `GET /api/health` - Health check

## Database Schema

### User Model
```javascript
{
  googleId: String,
  email: String,
  name: String,
  avatar: String,
  gameStats: {
    origami: { gamesPlayed, bestTime, totalScore, averageAccuracy, completedShapes },
    speedTyping: { gamesPlayed, bestWPM, bestAccuracy, totalWordsTyped, averageWPM },
    memoryGame: { gamesPlayed, bestScore, bestAccuracy, averageScore, totalChallenges }
  }
}
```

### Game Session Model
```javascript
{
  userId: ObjectId,
  gameType: String,
  difficulty: String,
  score: Number,
  duration: Number,
  accuracy: Number,
  gameData: Mixed
}
```

## Development

### Project Structure
```
braindevils-games/
├── public/                 # Frontend files
│   ├── js/                # JavaScript modules
│   │   ├── games/         # Game implementations
│   │   ├── auth.js        # Authentication logic
│   │   ├── api.js         # API client
│   │   └── app.js         # Main application
│   ├── styles/            # CSS files
│   ├── images/            # Game assets
│   └── index.html         # Main HTML file
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md             # This file
```

### Available Scripts
- `npm run dev` - Start development servers
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm start` - Start production server
- `npm test` - Run tests

### Adding New Games
1. Create game class in `public/js/games/`
2. Implement required methods: `init()`, `start()`, `reset()`
3. Add game card to main menu in `index.html`
4. Update `app.js` to handle new game type
5. Add game-specific styles to CSS