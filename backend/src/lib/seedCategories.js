import mongoose from 'mongoose';
import Category, { sampleCategories } from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const seedCategories = async () => {
  try {
    console.log('Starting category seeding...');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Create parent categories first
    const parentCategories = sampleCategories.filter(cat => !cat.parentSlug);
    const parentMap = new Map();
    
    for (const catData of parentCategories) {
      const category = await Category.create(catData);
      parentMap.set(category.slug, category._id);
      console.log(`Created parent category: ${category.name.en}`);
    }
    
    // Create child categories
    const childCategories = sampleCategories.filter(cat => cat.parentSlug);
    
    for (const catData of childCategories) {
      const parentId = parentMap.get(catData.parentSlug);
      if (parentId) {
        const { parentSlug, ...categoryData } = catData;
        categoryData.parent = parentId;
        
        const category = await Category.create(categoryData);
        parentMap.set(category.slug, category._id);
        console.log(`Created child category: ${category.name.en} under ${catData.parentSlug}`);
      } else {
        console.warn(`Parent not found for ${catData.name.en}: ${catData.parentSlug}`);
      }
    }
    
    console.log('Category seeding completed successfully!');
    
    // Display the tree structure
    const tree = await Category.getCategoryTree();
    console.log('\nCategory tree structure:');
    console.log(JSON.stringify(tree, null, 2));
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGO_URI;
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedCategories();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedCategories };