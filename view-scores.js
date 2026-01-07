const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (same as in server.js)
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

// Game Session Schema (same as in server.js)
const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, enum: ['origami', 'speedTyping', 'memoryGame'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  score: { type: Number, required: true },
  duration: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  gameData: mongoose.Schema.Types.Mixed
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);

async function viewUserScores() {
  try {
    console.log('🔍 Fetching user data from MongoDB...\n');
    
    // Get all users with their stats
    const users = await User.find({}).select('name email gameStats createdAt lastLogin');
    
    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      return;
    }
    
    console.log(`👥 Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name} (${user.email})`);
      console.log(`   📅 Joined: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   🕐 Last Login: ${user.lastLogin.toLocaleDateString()}`);
      console.log(`   🎮 Game Stats:`);
      
      // Origami stats
      const origami = user.gameStats.origami;
      console.log(`      🎨 Origami: ${origami.gamesPlayed} games, ${origami.completedShapes} shapes, Best Time: ${origami.bestTime}s`);
      
      // Speed Typing stats
      const typing = user.gameStats.speedTyping;
      console.log(`      ⌨️  Speed Typing: ${typing.gamesPlayed} games, Best WPM: ${typing.bestWPM}, Best Accuracy: ${typing.bestAccuracy}%`);
      
      // Memory Game stats
      const memory = user.gameStats.memoryGame;
      console.log(`      🧠 Memory: ${memory.gamesPlayed} games, Best Score: ${memory.bestScore}, Best Accuracy: ${memory.bestAccuracy}%`);
      
      console.log('');
    });
    
    // Get recent game sessions
    console.log('🎯 Recent Game Sessions:\n');
    const recentSessions = await GameSession.find({})
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .limit(10);
    
    if (recentSessions.length === 0) {
      console.log('❌ No game sessions found.');
    } else {
      recentSessions.forEach((session, index) => {
        const date = session.completedAt.toLocaleDateString();
        const time = session.completedAt.toLocaleTimeString();
        console.log(`${index + 1}. 🎮 ${session.userId.name} played ${session.gameType} (${session.difficulty})`);
        console.log(`   📊 Score: ${session.score}, Accuracy: ${session.accuracy}%, Duration: ${session.duration}s`);
        console.log(`   📅 ${date} at ${time}\n`);
      });
    }
    
    // Summary statistics
    console.log('📈 Summary Statistics:');
    const totalSessions = await GameSession.countDocuments();
    const avgScore = await GameSession.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    
    console.log(`   🎯 Total Game Sessions: ${totalSessions}`);
    if (avgScore.length > 0) {
      console.log(`   📊 Average Score: ${Math.round(avgScore[0].avgScore)}`);
    }
    
    // Game type breakdown
    const gameTypeStats = await GameSession.aggregate([
      { $group: { _id: '$gameType', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`   🎮 Games by Type:`);
    gameTypeStats.forEach(stat => {
      console.log(`      ${stat._id}: ${stat.count} sessions (avg score: ${Math.round(stat.avgScore)})`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  }
}

// Run the script
viewUserScores();