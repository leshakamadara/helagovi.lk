import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const verifyUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/helagovi';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find and update the farmer user
    const user = await User.findOne({ email: 'farmer@gmail.com' });
    
    if (!user) {
      console.log('User farmer@gmail.com not found');
      process.exit(1);
    }

    console.log('Found user:', {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });

    // Update verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    console.log('✅ User farmer@gmail.com has been verified successfully!');

    // Verify the update
    const updatedUser = await User.findOne({ email: 'farmer@gmail.com' });
    console.log('Updated user status:', {
      isVerified: updatedUser.isVerified,
      verificationToken: updatedUser.verificationToken,
      verificationExpires: updatedUser.verificationExpires
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

verifyUser();