import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';

dotenv.config();

async function fixProductCategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find the product
    const productId = '68d3adc918abfb30f786d044';
    const product = await Product.findById(productId);
    
    if (!product) {
      console.log('Product not found');
      process.exit(1);
    }
    
    console.log('Product:', product.title, '- Current category:', product.category);
    
    // Find suitable categories for "Babata Strawberry"
    console.log('\nSearching for suitable categories...');
    
    // Look for fruit-related categories
    const fruitCategories = await Category.find({
      $or: [
        { 'name.en': /fruit/i },
        { 'name.en': /berry/i },
        { 'name.en': /seasonal/i }
      ]
    });
    
    console.log('Available fruit-related categories:');
    fruitCategories.forEach(cat => {
      console.log(`- ${cat.name.en} (${cat.slug}) - ID: ${cat._id}`);
    });
    
    // Also show root categories
    const rootCategories = await Category.find({ level: 0 });
    console.log('\nRoot categories:');
    rootCategories.forEach(cat => {
      console.log(`- ${cat.name.en} (${cat.slug}) - ID: ${cat._id}`);
    });
    
    // Update the product to use "Seasonal Fruits" category
    const seasonalFruits = await Category.findOne({ 'name.en': 'Seasonal Fruits' });
    if (seasonalFruits) {
      console.log(`\n✅ Updating product category to: ${seasonalFruits.name.en}`);
      
      product.category = seasonalFruits._id;
      await product.save();
      
      console.log('Product category updated successfully!');
    } else {
      // Fallback to Fruits root category
      const fruits = await Category.findOne({ 'name.en': 'Fruits' });
      if (fruits) {
        console.log(`\n✅ Updating product category to: ${fruits.name.en} (fallback)`);
        product.category = fruits._id;
        await product.save();
        console.log('Product category updated successfully!');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixProductCategory();