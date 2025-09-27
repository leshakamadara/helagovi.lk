import { cache, CACHE_DURATION } from '../lib/cache.js';

// Generic cache middleware
export const cacheMiddleware = (
  keyGenerator, 
  duration = CACHE_DURATION.MEDIUM,
  skipCache = false
) => {
  return async (req, res, next) => {
    // Skip caching if disabled or not available
    if (skipCache || !cache.isAvailable()) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original res.json method
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache successful responses
      res.json = function(data) {
        // Cache successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, data, duration).catch(err => {
            console.error('Cache set error in middleware:', err);
          });
        }
        
        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware (for POST, PUT, DELETE operations)
export const cacheInvalidationMiddleware = (patterns = []) => {
  return async (req, res, next) => {
    // Store original res.json method
    const originalJson = res.json.bind(res);
    
    // Override res.json to invalidate cache after successful operations
    res.json = function(data) {
      // Invalidate cache for successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => {
          cache.clearPattern(pattern).catch(err => {
            console.error('Cache invalidation error:', err);
          });
        });
      }
      
      // Call original json method
      return originalJson(data);
    };

    next();
  };
};