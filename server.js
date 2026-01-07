const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com"]
    }
  }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:3001', 'https://braindevils-games.vercel.app'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.static('public'));

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/braindevils', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  gameStats: {
    origami: {
      gamesPlayed: { type: Number, default: 0 },
      bestTime: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      completedShapes: { type: Number, default: 0 }
    },
    speedTyping: {
      gamesPlayed: { type: Number, default: 0 },
      bestWPM: { type: Number, default: 0 },
      bestAccuracy: { type: Number, default: 0 },
      totalWordsTyped: { type: Number, default: 0 },
      averageWPM: { type: Number, default: 0 }
    },
    memoryGame: {
      gamesPlayed: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      bestAccuracy: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalChallenges: { type: Number, default: 0 }
    }
  }
});

const User = mongoose.model('User', userSchema);

// Game Session Schema
const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, enum: ['origami', 'speedTyping', 'memoryGame'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  score: { type: Number, required: true },
  duration: { type: Number, required: true }, // in seconds
  accuracy: { type: Number, required: true }, // percentage
  completedAt: { type: Date, default: Date.now },
  gameData: mongoose.Schema.Types.Mixed // specific game data
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Google OAuth login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Received Google auth request');
    
    if (!token) {
      console.error('No token provided');
      return res.status(400).json({ error: 'No token provided' });
    }

    console.log('Verifying Google token...');
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;
    console.log('Google token verified for user:', email);

    let user = await User.findOne({ googleId });
    
    if (!user) {
      console.log('Creating new user:', email);
      user = new User({
        googleId,
        email,
        name,
        avatar
      });
      await user.save();
    } else {
      console.log('Updating existing user:', email);
      user.lastLogin = new Date();
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', user.email);
    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        gameStats: user.gameStats
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    console.error('Full error:', error);
    res.status(400).json({ error: `Authentication failed: ${error.message}` });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      gameStats: user.gameStats,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save game session
app.post('/api/game/session', authenticateToken, async (req, res) => {
  try {
    const { gameType, difficulty, score, duration, accuracy, gameData } = req.body;

    // Create game session
    const session = new GameSession({
      userId: req.user.userId,
      gameType,
      difficulty,
      score,
      duration,
      accuracy,
      gameData
    });
    await session.save();

    // Update user stats
    const user = await User.findById(req.user.userId);
    const gameStats = user.gameStats[gameType];

    gameStats.gamesPlayed += 1;
    gameStats.totalScore += score;

    switch (gameType) {
      case 'origami':
        if (duration > 0 && (gameStats.bestTime === 0 || duration < gameStats.bestTime)) {
          gameStats.bestTime = duration;
        }
        gameStats.averageAccuracy = ((gameStats.averageAccuracy * (gameStats.gamesPlayed - 1)) + accuracy) / gameStats.gamesPlayed;
        if (accuracy === 100) {
          gameStats.completedShapes += 1;
        }
        break;

      case 'speedTyping':
        const wpm = gameData.wpm || 0;
        if (wpm > gameStats.bestWPM) {
          gameStats.bestWPM = wpm;
        }
        if (accuracy > gameStats.bestAccuracy) {
          gameStats.bestAccuracy = accuracy;
        }
        gameStats.totalWordsTyped += gameData.wordsTyped || 0;
        gameStats.averageWPM = ((gameStats.averageWPM * (gameStats.gamesPlayed - 1)) + wpm) / gameStats.gamesPlayed;
        break;

      case 'memoryGame':
        if (score > gameStats.bestScore) {
          gameStats.bestScore = score;
        }
        if (accuracy > gameStats.bestAccuracy) {
          gameStats.bestAccuracy = accuracy;
        }
        gameStats.averageScore = ((gameStats.averageScore * (gameStats.gamesPlayed - 1)) + score) / gameStats.gamesPlayed;
        gameStats.totalChallenges += 1;
        break;
    }

    await user.save();

    res.json({ 
      message: 'Game session saved successfully',
      sessionId: session._id,
      updatedStats: user.gameStats[gameType]
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Failed to save game session' });
  }
});

// Get game history
app.get('/api/game/history/:gameType?', authenticateToken, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const query = { userId: req.user.userId };
    if (gameType) {
      query.gameType = gameType;
    }

    const sessions = await GameSession.find(query)
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await GameSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

// Get leaderboard
app.get('/api/leaderboard/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10 } = req.query;

    let sortField;
    switch (gameType) {
      case 'origami':
        sortField = 'gameStats.origami.completedShapes';
        break;
      case 'speedTyping':
        sortField = 'gameStats.speedTyping.bestWPM';
        break;
      case 'memoryGame':
        sortField = 'gameStats.memoryGame.bestScore';
        break;
      default:
        return res.status(400).json({ error: 'Invalid game type' });
    }

    const users = await User.find({})
      .select('name avatar gameStats')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      avatar: user.avatar,
      stats: user.gameStats[gameType]
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Admin endpoint to view user scores (for development)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}).select('name email gameStats createdAt lastLogin');
    const recentSessions = await GameSession.find({})
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .limit(20);
    
    const totalSessions = await GameSession.countDocuments();
    
    res.json({
      users: users.map(user => ({
        name: user.name,
        email: user.email,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        stats: user.gameStats
      })),
      recentSessions: recentSessions.map(session => ({
        playerName: session.userId.name,
        gameType: session.gameType,
        difficulty: session.difficulty,
        score: session.score,
        accuracy: session.accuracy,
        duration: session.duration,
        completedAt: session.completedAt
      })),
      summary: {
        totalUsers: users.length,
        totalSessions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Serve static files for any non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});