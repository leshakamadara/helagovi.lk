import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary with validation
const configureCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  
  // Validate required environment variables
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error('Cloudinary configuration error:');
    console.error('CLOUDINARY_CLOUD_NAME:', config.cloud_name);
    console.error('CLOUDINARY_API_KEY:', config.api_key ? 'Present' : 'Missing');
    console.error('CLOUDINARY_API_SECRET:', config.api_secret ? 'Present' : 'Missing');
    throw new Error('Missing required Cloudinary environment variables');
  }
  
  cloudinary.config(config);
  console.log('Cloudinary configured successfully');
  return config;
};

// Initialize Cloudinary configuration
configureCloudinary();

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helagovi', // Folder name in Cloudinary
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' }, // Resize images
      { quality: 'auto', fetch_format: 'auto' } // Optimize quality and format
    ],
  },
});

console.log('Cloudinary storage configured for folder: helagovi');

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

export { cloudinary, upload };