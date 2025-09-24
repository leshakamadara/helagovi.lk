import api from '../lib/axios';

export const imageService = {
  // Upload multiple product images
  uploadProductImages: async (files) => {
    const formData = new FormData();
    
    // Add files to FormData
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/upload/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data.images
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload images'
      };
    }
  },

  // Delete image by public ID
  deleteProductImage: async (publicId) => {
    try {
      const response = await api.delete(`/upload/products/${publicId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete image'
      };
    }
  },

  // Validate image files before upload
  validateImages: (files) => {
    const errors = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    files.forEach((file, index) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`Image ${index + 1}: File size exceeds 10MB`);
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Image ${index + 1}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed`);
      }
    });

    // Check total number of files
    if (files.length > 5) {
      errors.push('Maximum 5 images allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default imageService;