# BrainDevils - Fine Motor Skills (FMS) Training Games

A modern, professional brain training platform featuring three engaging games: Balance It, Speed Typing, and Memory Challenge. Built with vanilla JavaScript, Node.js, Express, and MongoDB with Google OAuth integration.

## Features

- **Clean, Professional UI**: Simplified design inspired by Wordle and modern web applications
- **Dark/Light Mode Toggle**: User-friendly theme switching with persistent preferences
- **Google OAuth Authentication**: Secure login with Google accounts
- **Progress Tracking**: MongoDB integration to track user progress and statistics
- **Three Engaging Games**:
  - **Balance It**: Physics-based ball balancing game with realistic torque and gravity simulation
  - **Speed Typing**: Typing speed and accuracy challenges with adaptive difficulty
  - **Memory Challenge**: Pattern recognition and working memory training
- **Difficulty Levels**: Easy, Medium, and Hard for each game with adaptive parameters
- **Responsive Design**: Works on desktop and mobile devices with hamburger menu
- **Real-time Statistics**: Track performance metrics and improvement over time
- **Glassmorphism UI**: Modern visual effects with backdrop blur and transparency

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 with glassmorphism effects
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: Google OAuth 2.0 with JWT tokens
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Deployment**: Vercel with serverless functions
- **Development**: Nodemon, Concurrently

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/braindevils-games.git
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
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/braindevils
   JWT_SECRET=your-super-secret-jwt-key-here
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLIENT_URL=https://your-domain.vercel.app
   ```

4. **Google OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API and Google Identity services
   - Create OAuth 2.0 credentials
   - Add authorized origins and redirect URIs
   - Update environment variables with your credentials

5. **Start the application**
   ```bash
   npm run dev
   ```

## Game Details

### Balance It
- **Realistic Physics**: Implements proper torque, rotational motion, and gravity
- **Dual Controls**: Mouse movement or keyboard arrow keys (← →)
- **Progressive Difficulty**: Shorter sticks and faster sensitivity increases
- **Physics Simulation**: Ball mass affects sliding speed, stick responds only to user input
- **Visual Feedback**: Real-time physics info, balance indicators, and torque visualization
- **Scoring**: Points based on survival time with increasing sensitivity multiplier

### Speed Typing
- **Adaptive Word Lists**: Difficulty-appropriate vocabulary with length filtering
- **Real-time Feedback**: Immediate visual feedback on typing accuracy
- **Performance Metrics**: WPM, accuracy percentage, error tracking
- **Timed Challenges**: 60s (easy), 45s (medium), 30s (hard)
- **Progress Tracking**: Best scores and improvement over time

### Memory Challenge
- **Grid-based Patterns**: 2x2 to 4x4 grids based on difficulty
- **Shape Recognition**: Four distinct shapes (star, square, circle, triangle)
- **No Time Pressure**: Game completes only when all inputs are filled
- **Visual Feedback**: Color-coded correct/incorrect responses
- **Progressive Difficulty**: Larger grids with shorter memorization time

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login with ID token verification
- `GET /api/user/profile` - Get authenticated user profile

### Game Data
- `POST /api/game/session` - Save game session with statistics update
- `GET /api/game/history/:gameType?` - Get paginated game history
- `GET /api/leaderboard/:gameType` - Get top players leaderboard

### Admin & Utility
- `GET /api/health` - Health check endpoint
- `GET /api/admin/users` - View user statistics (development)

## Database Schema

### User Model
```javascript
{
  googleId: String,
  email: String,
  name: String,
  avatar: String,
  createdAt: Date,
  lastLogin: Date,
  gameStats: {
    balance: { 
      gamesPlayed: Number, 
      bestTime: Number, 
      totalScore: Number, 
      averageTime: Number, 
      maxSensitivity: Number 
    },
    speedTyping: { 
      gamesPlayed: Number, 
      bestWPM: Number, 
      bestAccuracy: Number, 
      totalWordsTyped: Number, 
      averageWPM: Number 
    },
    memoryGame: { 
      gamesPlayed: Number, 
      bestScore: Number, 
      bestAccuracy: Number, 
      averageScore: Number, 
      totalChallenges: Number 
    }
  }
}
```

### Game Session Model
```javascript
{
  userId: ObjectId,
  gameType: String, // 'balance', 'speedTyping', 'memoryGame'
  difficulty: String, // 'easy', 'medium', 'hard'
  score: Number,
  duration: Number, // seconds
  accuracy: Number, // percentage
  completedAt: Date,
  gameData: Mixed // game-specific data
}
```

## Development

### Project Structure
```
braindevils-games/
├── public/                 # Frontend files
│   ├── js/                # JavaScript modules
│   │   ├── games/         # Game implementations
│   │   │   ├── balance.js # Physics-based balance game
│   │   │   ├── typing.js  # Speed typing game
│   │   │   └── memory.js  # Memory challenge game
│   │   ├── auth.js        # Authentication & theme management
│   │   ├── api.js         # API client with error handling
│   │   └── app.js         # Main application controller
│   ├── styles/            # CSS with glassmorphism effects
│   ├── images/            # Game assets and logo
│   ├── words.txt          # Word list for typing game
│   └── index.html         # Single-page application
├── server.js              # Express server with MongoDB
├── vercel.json            # Vercel deployment configuration
├── package.json           # Dependencies and scripts
└── README.md             # This documentation
```

### Available Scripts
- `npm run dev` - Start development with auto-reload
- `npm run server` - Start backend server only
- `npm start` - Start production server
- `npm test` - Run test suite (if implemented)

### Key Features Implementation

#### Physics Engine (Balance Game)
- Realistic torque calculations based on ball position
- Separate physics for stick rotation (user-controlled) and ball movement (gravity-based)
- Proper moment of inertia calculations for rotational dynamics
- Friction and damping for realistic movement

#### Responsive Design
- Mobile-first approach with hamburger menu
- Glassmorphism effects with backdrop-filter support
- CSS Grid and Flexbox for layout
- Touch-friendly controls and interactions

#### Authentication Flow
- Google OAuth 2.0 with secure JWT token storage
- Automatic token validation and refresh
- User profile management with game statistics
- Secure API endpoints with middleware protection

### Deployment

The application is deployed on Vercel with:
- Automatic deployments from GitHub
- Environment variable management
- MongoDB Atlas integration
- Custom domain support

Live Demo: [https://braindevils-games.vercel.app](https://braindevils-games.vercel.app)

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the LICENSE file for details.