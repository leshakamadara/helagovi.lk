#!/usr/bin/env node

/**
 * Script to update all products with their review statistics
 * Run this script to populate averageRating and totalReviews fields for existing products
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { updateAllProductReviewStats } from '../src/lib/updateProductReviewStats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function main() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/helagovi';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Update all product review stats
    console.log('🚀 Starting to update all product review statistics...');
    const result = await updateAllProductReviewStats();

    if (result.success) {
      console.log('✅ Successfully completed review stats update!');
      console.log(`📊 Updated ${result.data.successful} products successfully`);
      if (result.data.failed > 0) {
        console.log(`⚠️  Failed to update ${result.data.failed} products`);
      }
    } else {
      console.error('❌ Failed to update product review stats:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('🔒 Database connection closed');
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Script interrupted by user');
  try {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Script terminated');
  try {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});