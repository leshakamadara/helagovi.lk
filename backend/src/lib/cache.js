import { Redis } from '@upstash/redis';

// Initialize Redis client 
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Cache durations in seconds
export const CACHE_DURATION = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes  
  LONG: 3600,    // 1 hour
  DAILY: 86400   // 24 hours
};

export const cache = {
  // Check if Redis is available
  isAvailable() {
    return redis !== null;
  },

  // Get from cache
  async get(key) {
    if (!redis) {
      console.log('Redis not available, skipping cache get');
      return null;
    }
    
    try {
      const data = await redis.get(key);
      if (data) {
        console.log(` Cache HIT: ${key}`);
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
      console.log(` Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  // Set to cache
  async set(key, data, duration = CACHE_DURATION.MEDIUM) {
    if (!redis) {
      console.log('Redis not available, skipping cache set');
      return false;
    }
    
    try {
      await redis.setex(key, duration, JSON.stringify(data));
      console.log(` Cache SET: ${key} (expires in ${duration}s)`);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  // Delete from cache
  async del(key) {
    if (!redis) {
      console.log('Redis not available, skipping cache delete');
      return false;
    }
    
    try {
      const result = await redis.del(key);
      console.log(`🗑️  Cache DELETE: ${key}`);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  },

  // Clear multiple keys by pattern
  async clearPattern(pattern) {
    if (!redis) {
      console.log('Redis not available, skipping cache clear');
      return false;
    }
    
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🧹 Cache CLEARED: ${keys.length} keys matching "${pattern}"`);
      }
      return true;
    } catch (error) {
      console.error('Redis clear pattern error:', error);
      return false;
    }
  },

  // Get cache info
  async getInfo() {
    if (!redis) {
      return { available: false, message: 'Redis not configured' };
    }
    
    try {
      const info = await redis.info();
      return { available: true, info };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
};

// Cache key generators
export const cacheKeys = {
  priceStats: () => 'price-stats',
  categories: () => 'categories:roots',
  products: (page = 1, limit = 12, filters = {}) => {
    const { category, search, district, minPrice, maxPrice, isOrganic, sortBy, sortOrder } = filters;
    return `products:${page}:${limit}:${category || 'all'}:${search || ''}:${district || ''}:${minPrice || ''}:${maxPrice || ''}:${isOrganic || ''}:${sortBy || 'newest'}:${sortOrder || 'desc'}`;
  },
  userProfile: (userId) => `user:${userId}:profile`,
  productDetails: (productId) => `product:${productId}:details`
};