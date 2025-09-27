import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate random token for email verification and password reset
export const generateRandomToken = () => {
  return randomBytes(32).toString('hex');
};