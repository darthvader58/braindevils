const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is missing');
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Database name:', connection.connection.db.databaseName);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ test: 'connection test' });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    await TestModel.deleteOne({ test: 'connection test' });
    console.log('✅ Test document deleted successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Fix: Check your username/password in MongoDB Atlas');
    } else if (error.message.includes('hostname') || error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Fix: Check your cluster URL and network access');
    } else if (error.message.includes('IP')) {
      console.log('\n🔧 Fix: Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas');
    }
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();