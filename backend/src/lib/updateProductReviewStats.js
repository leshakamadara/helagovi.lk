import Review from '../models/Review.js';
import Product from '../models/Product.js';

/**
 * Updates the average rating and total reviews count for a product
 * @param {string} productId - The ID of the product to update
 */
export const updateProductReviewStats = async (productId) => {
  try {
    console.log(`Updating review stats for product: ${productId}`);
    
    // Get all approved reviews for this product
    const reviews = await Review.find({ 
      product: productId,
      status: 'approved' // Only count approved reviews
    });

    console.log(`Found ${reviews.length} approved reviews for product ${productId}`);

    // Calculate average rating and total count
    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal place
    }

    console.log(`Calculated stats - Average: ${averageRating}, Total: ${totalReviews}`);

    // Update the product with new stats
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        averageRating,
        totalReviews
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      console.error(`Product with ID ${productId} not found`);
      return { success: false, error: 'Product not found' };
    }

    console.log(`Successfully updated product ${productId} - Rating: ${averageRating}, Reviews: ${totalReviews}`);

    return {
      success: true,
      data: {
        productId,
        averageRating,
        totalReviews,
        updatedProduct
      }
    };

  } catch (error) {
    console.error(`Error updating review stats for product ${productId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Bulk update review stats for multiple products
 * @param {string[]} productIds - Array of product IDs to update
 */
export const bulkUpdateProductReviewStats = async (productIds) => {
  try {
    console.log(`Bulk updating review stats for ${productIds.length} products`);
    
    const results = [];
    
    for (const productId of productIds) {
      const result = await updateProductReviewStats(productId);
      results.push(result);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Bulk update complete - Success: ${successful}, Failed: ${failed}`);

    return {
      success: true,
      data: {
        total: productIds.length,
        successful,
        failed,
        results
      }
    };

  } catch (error) {
    console.error('Error in bulk update:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update all products' review stats (useful for initial data migration)
 */
export const updateAllProductReviewStats = async () => {
  try {
    console.log('Starting bulk update of all product review stats...');
    
    // Get all products that have reviews
    const productsWithReviews = await Review.distinct('product');
    console.log(`Found ${productsWithReviews.length} products with reviews`);

    if (productsWithReviews.length === 0) {
      return {
        success: true,
        data: {
          message: 'No products with reviews found',
          updated: 0
        }
      };
    }

    // Update stats for all products with reviews
    const result = await bulkUpdateProductReviewStats(productsWithReviews);
    
    return result;

  } catch (error) {
    console.error('Error updating all product review stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  updateProductReviewStats,
  bulkUpdateProductReviewStats,
  updateAllProductReviewStats
};