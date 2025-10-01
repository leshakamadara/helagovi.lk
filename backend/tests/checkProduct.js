import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

async function checkProduct() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const productId = '68d3adc918abfb30f786d044';
    console.log('Searching for product:', productId);
    
    const product = await Product.findById(productId);
    if (product) {
      console.log('✅ Product found:');
      console.log('- Name:', product.title);
      console.log('- Category ID:', product.category);
      console.log('- Status:', product.status);
      console.log('- Available Quantity:', product.availableQuantity);
      console.log('- Created:', product.createdAt);
      
      // Check if category still exists
      const Category = (await import('./src/models/Category.js')).default;
      if (product.category) {
        const category = await Category.findById(product.category);
        if (category) {
          console.log('- Category exists:', category.name.en);
        } else {
          console.log('❌ Category NOT FOUND for this product');
        }
      } else {
        console.log('❌ No category assigned to product');
      }
    } else {
      console.log('❌ Product NOT FOUND');
      
      // Check if there are any products at all
      const allProducts = await Product.find({}).limit(3);
      const totalCount = await Product.countDocuments();
      console.log('Total products in database:', totalCount);
      console.log('Sample product IDs:');
      allProducts.forEach(p => console.log('ID:', p._id.toString(), 'Name:', p.title));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkProduct();