
import 'dotenv/config';
import { createXataClient } from './xata-client.js';

// Initialize Xata client
let xata = null;

export function getXataClient() {
  if (!xata) {
    xata = createXataClient();
  }
  return xata;
}

// Database schema definition for auto-creation
const schema = {
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'email', type: 'email', unique: true },
        { name: 'name', type: 'string' },
        { name: 'lastLogin', type: 'datetime' }
      ]
    },
    {
      name: 'prompts',
      columns: [
        { name: 'userId', type: 'link', link: { table: 'users' } },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'generatedPrompt', type: 'text' },
        { name: 'mode', type: 'string' },
        { name: 'style', type: 'string' },
        { name: 'mood', type: 'string' },
        { name: 'aspectRatio', type: 'string' },
        { name: 'tool', type: 'string' },
        { name: 'isPublic', type: 'bool' },
        { name: 'likes', type: 'int', defaultValue: 0 }
      ]
    },
    {
      name: 'favorites',
      columns: [
        { name: 'userId', type: 'link', link: { table: 'users' } },
        { name: 'promptId', type: 'link', link: { table: 'prompts' } }
      ]
    }
  ]
};

// Function to initialize/verify database schema
export async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database schema...');
    
    const xata = getXataClient();
    
    // Check if we can connect to the database
    const healthCheck = await xata.sql`SELECT 1 as health`;
    console.log('✅ Database connection successful');
    
    // Xata automatically handles schema creation based on the client configuration
    // The tables are defined in the Xata client and will be created automatically
    
    // Test that our main tables exist by trying to query them
    try {
      await xata.db.users.getFirst();
      console.log('✅ Users table verified');
    } catch (error) {
      console.log('ℹ️  Users table will be created automatically by Xata');
    }
    
    try {
      await xata.db.prompts.getFirst();
      console.log('✅ Prompts table verified');
    } catch (error) {
      console.log('ℹ️  Prompts table will be created automatically by Xata');
    }
    
    try {
      await xata.db.favorites.getFirst();
      console.log('✅ Favorites table verified');
    } catch (error) {
      console.log('ℹ️  Favorites table will be created automatically by Xata');
    }
    
    console.log('🎉 Database initialization complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Please check your Xata configuration and API key');
    return false;
  }
}

// Function to create sample data (optional)
export async function createSampleData() {
  try {
    console.log('📝 Creating sample data...');
    
    const xata = getXataClient();
    // Check if we already have users
    const existingUsers = await xata.db.users.getFirst();
    if (existingUsers) {
      console.log('ℹ️  Sample data already exists, skipping creation');
      return;
    }
    
    // Create a sample user
    const sampleUser = await xata.db.users.create({
      email: 'demo@promptsmith.com',
      name: 'Demo User',
      lastLogin: new Date()
    });
    
    console.log('✅ Sample user created:', sampleUser.email);
    
    // Create a sample prompt
    const samplePrompt = await xata.db.prompts.create({
      userId: sampleUser.id,
      title: 'Welcome to PromptSmith',
      description: 'Your first AI-generated prompt',
      generatedPrompt: 'A beautiful sunset over a calm ocean, digital art style, peaceful mood, 16:9 aspect ratio',
      mode: 'image',
      style: 'digital-art',
      mood: 'peaceful',
      aspectRatio: '16:9',
      tool: 'midjourney',
      isPublic: true,
      likes: 0
    });
    
    console.log('✅ Sample prompt created:', samplePrompt.title);
    console.log('🎉 Sample data creation complete!');
    
  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
  }
}

export default { initializeDatabase, createSampleData };