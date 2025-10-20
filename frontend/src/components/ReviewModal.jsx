import React, { useState } from 'react';
import { Star, X, Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import api from '../lib/axios';

const ReviewModal = ({ isOpen, onClose, order }) => {
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [existingReviewData, setExistingReviewData] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const [previewImages, setPreviewImages] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize reviews for each item
  React.useEffect(() => {
    if (order && order.items) {
      const initializeReviews = async () => {
        setLoading(true);
        console.log('Initializing reviews for order:', order._id);
        const initialReviews = {};
        const existingData = {};
        
        for (const [index, item] of order.items.entries()) {
          const productId = typeof item.product === 'object' ? item.product._id : item.product;
          console.log(`Processing item ${index + 1}/${order.items.length}, productId:`, productId);
          
          // Check if user has already reviewed this product
          try {
            const eligibilityResponse = await api.get(`/reviews/eligibility/${productId}`);
            const hasExistingReview = !eligibilityResponse.data.data.canReview;
            console.log(`Product ${productId} hasExistingReview:`, hasExistingReview);
            
            if (hasExistingReview) {
              // Fetch existing review data - try to get user's reviews and find this product
              try {
                console.log('Fetching user reviews to find review for product:', productId);
                const userReviewsResponse = await api.get('/reviews/my');
                const userReviews = userReviewsResponse.data?.data?.reviews || [];
                
                console.log('User reviews:', userReviews);
                
                const userReview = userReviews.find(review => {
                  const reviewProductId = typeof review.product === 'object' ? review.product._id : review.product;
                  console.log('Comparing review product:', reviewProductId, 'with target:', productId);
                  return reviewProductId === productId;
                });
                
                if (userReview) {
                  console.log('Found existing review for product:', productId, userReview);
                  existingData[index] = {
                    reviewId: userReview._id,
                    existingReview: userReview
                  };
                  
                  initialReviews[index] = {
                    productId: productId,
                    productTitle: item.productSnapshot?.title || (typeof item.product === 'object' ? item.product.title : 'Unknown Product'),
                    rating: userReview.rating,
                    title: userReview.title,
                    comment: userReview.comment,
                    images: userReview.images || []
                  };
                  continue;
                } else {
                  console.log('No user review found for product:', productId);
                  console.log('Available product IDs in user reviews:', userReviews.map(r => typeof r.product === 'object' ? r.product._id : r.product));
                }
              } catch (error) {
                console.warn(`Could not fetch user reviews for product ${productId}:`, error);
                // If we can't fetch the review but know it exists, we might have a permission issue
                // Let's continue with a default review form
              }
            }
          } catch (error) {
            console.warn(`Could not check review eligibility for product ${productId}:`, error);
          }
          
          // Default empty review
          initialReviews[index] = {
            productId: productId,
            productTitle: item.productSnapshot?.title || (typeof item.product === 'object' ? item.product.title : 'Unknown Product'),
            rating: 5,
            title: '',
            comment: '',
            images: []
          };
        }
        
        console.log('Setting initial reviews:', initialReviews);
        console.log('Setting existing review data:', existingData);
        setReviews(initialReviews);
        setExistingReviewData(existingData);
        setLoading(false);
      };
      
      initializeReviews();
    }
  }, [order]);

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      // Revoke all preview URLs to prevent memory leaks
      Object.values(previewImages).forEach(previews => {
        previews.forEach(preview => {
          if (preview.url) {
            URL.revokeObjectURL(preview.url);
          }
        });
      });
    };
  }, [previewImages]);  const handleRatingChange = (itemIndex, rating) => {
    setReviews(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        rating
      }
    }));
  };

  const handleInputChange = (itemIndex, field, value) => {
    setReviews(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [field]: value
      }
    }));
  };

  const handleImageSelect = (itemIndex, files) => {
    if (!files || files.length === 0) return;

    // Create preview URLs for selected files
    const selectedFiles = Array.from(files);
    const previewUrls = selectedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isPreview: true
    }));

    // Add previews to state
    setPreviewImages(prev => ({
      ...prev,
      [itemIndex]: [...(prev[itemIndex] || []), ...previewUrls]
    }));

    // Upload images to Cloudinary
    handleImageUpload(itemIndex, selectedFiles);
  };

  const handleImageUpload = async (itemIndex, files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(prev => ({ ...prev, [itemIndex]: true }));

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Replace preview images with uploaded images
        setPreviewImages(prev => ({
          ...prev,
          [itemIndex]: (prev[itemIndex] || []).filter(img => !img.isPreview)
        }));

        setReviews(prev => ({
          ...prev,
          [itemIndex]: {
            ...prev[itemIndex],
            images: [...(prev[itemIndex].images || []), ...response.data.data.images]
          }
        }));
        toast.success('Images uploaded successfully!');
      } else {
        // Remove preview images on failure
        setPreviewImages(prev => ({
          ...prev,
          [itemIndex]: (prev[itemIndex] || []).filter(img => !img.isPreview)
        }));
        toast.error(response.data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      // Remove preview images on error
      setPreviewImages(prev => ({
        ...prev,
        [itemIndex]: (prev[itemIndex] || []).filter(img => !img.isPreview)
      }));
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(prev => ({ ...prev, [itemIndex]: false }));
    }
  };

  const removeImage = (itemIndex, imageIndex, isPreview = false) => {
    if (isPreview) {
      // Remove preview image and revoke URL to prevent memory leaks
      setPreviewImages(prev => {
        const currentPreviews = prev[itemIndex] || [];
        const imageToRemove = currentPreviews[imageIndex];
        if (imageToRemove && imageToRemove.url) {
          URL.revokeObjectURL(imageToRemove.url);
        }
        return {
          ...prev,
          [itemIndex]: currentPreviews.filter((_, i) => i !== imageIndex)
        };
      });
    } else {
      // Remove uploaded image
      setReviews(prev => ({
        ...prev,
        [itemIndex]: {
          ...prev[itemIndex],
          images: prev[itemIndex].images.filter((_, i) => i !== imageIndex)
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all reviews
    const reviewsToSubmit = [];
    for (const [index, review] of Object.entries(reviews)) {
      if (!review.rating) {
        toast.error(`Please select a rating for ${review.productTitle}`);
        return;
      }
      if (!review.title.trim()) {
        toast.error(`Please enter a title for ${review.productTitle}`);
        return;
      }
      if (review.title.trim().length < 5) {
        toast.error(`Title for ${review.productTitle} must be at least 5 characters long`);
        return;
      }
      if (review.title.trim().length > 100) {
        toast.error(`Title for ${review.productTitle} must be less than 100 characters`);
        return;
      }
      if (!review.comment.trim()) {
        toast.error(`Please enter a review for ${review.productTitle}`);
        return;
      }
      if (review.comment.trim().length < 10) {
        toast.error(`Review for ${review.productTitle} must be at least 10 characters long`);
        return;
      }
      if (review.comment.trim().length > 1000) {
        toast.error(`Review for ${review.productTitle} must be less than 1000 characters`);
        return;
      }
      reviewsToSubmit.push({ ...review, itemIndex: index });
    }

    if (reviewsToSubmit.length === 0) {
      toast.error('No reviews to submit');
      return;
    }

    setSubmitting(true);

    try {
      // Submit reviews individually to provide better error handling
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const review of reviewsToSubmit) {
        const existingReview = existingReviewData[review.itemIndex];
        
        console.log('Submitting review:', {
          productId: review.productId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images: review.images,
          isUpdate: !!existingReview
        });
        
        try {
          let response;
          if (existingReview) {
            // Update existing review
            console.log('Updating existing review:', existingReview.reviewId);
            response = await api.put(`/reviews/${existingReview.reviewId}`, {
              rating: review.rating,
              title: review.title.trim(),
              comment: review.comment.trim(),
              images: review.images
            });
          } else {
            // Create new review
            console.log('Creating new review for product:', review.productId);
            response = await api.post(`/reviews/product/${review.productId}`, {
              rating: review.rating,
              title: review.title.trim(),
              comment: review.comment.trim(),
              images: review.images
            });
          }
          
          if (response.data.success) {
            successCount++;
            console.log(`Review ${existingReview ? 'updated' : 'created'} successfully for product:`, review.productId);
          } else {
            errorCount++;
            console.error(`Failed to ${existingReview ? 'update' : 'create'} review for product:`, review.productId, response.data);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error ${existingReview ? 'updating' : 'creating'} review for product:`, review.productId, error);
          results.push({
            productTitle: review.productTitle,
            error: error.response?.data?.message || error.message
          });
        }
      }

      // Provide appropriate feedback based on results
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} review${successCount > 1 ? 's' : ''} ${Object.keys(existingReviewData).length > 0 ? 'updated' : 'submitted'} successfully!`);
        onClose();
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`${successCount} review${successCount > 1 ? 's' : ''} processed successfully!`);
        toast.error(`${errorCount} review${errorCount > 1 ? 's' : ''} failed to process.`);
        onClose();
      } else {
        // All failed
        const errorMessage = results.length > 0 ? results[0].error : 'Failed to process reviews';
        toast.error(errorMessage);
      }

    } catch (error) {
      console.error('Unexpected error submitting reviews:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, itemIndex) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={() => handleRatingChange(itemIndex, star)}
          />
        ))}
      </div>
    );
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {Object.keys(existingReviewData).length > 0 ? 'Edit Reviews' : 'Write Reviews'} for Order #{order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            {Object.keys(existingReviewData).length > 0 
              ? 'Update your reviews for the products you purchased. Your feedback helps other buyers make informed decisions.'
              : 'Share your experience with the products you purchased. Your reviews help other buyers make informed decisions.'
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading your reviews...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {order.items.map((item, index) => {
              const review = reviews[index];
              if (!review) return null;

            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={item.productSnapshot?.image?.url || item.product?.primaryImage?.url || 'https://via.placeholder.com/80x80?text=Product'}
                    alt={review.productTitle}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/80x80?text=Product'}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{review.productTitle}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {item.productSnapshot?.unit || 'unit'}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {item.subtotal?.toLocaleString() || item.priceAtTime * item.quantity}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    {renderStars(review.rating, index)}
                  </div>

                  <div>
                    <Label htmlFor={`title-${index}`} className="text-sm font-medium">
                      Review Title
                    </Label>
                    <Input
                      id={`title-${index}`}
                      value={review.title}
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      placeholder="Summarize your experience"
                      maxLength={100}
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {review.title.length}/100 characters (minimum 5 required)
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`comment-${index}`} className="text-sm font-medium">
                      Your Review
                    </Label>
                    <Textarea
                      id={`comment-${index}`}
                      value={review.comment}
                      onChange={(e) => handleInputChange(index, 'comment', e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      rows={3}
                      maxLength={1000}
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {review.comment.length}/1000 characters (minimum 10 required)
                    </div>
                  </div>

                  {/* Image upload section */}
                  <div>
                    <Label className="text-sm font-medium">Photos (Optional)</Label>
                    <div className="mt-1">
                      {/* Display uploaded and preview images */}
                      {((review.images && review.images.length > 0) || (previewImages[index] && previewImages[index].length > 0)) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {/* Uploaded images */}
                          {review.images && review.images.map((image, imageIndex) => (
                            <div key={`uploaded-${imageIndex}`} className="relative group">
                              <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, imageIndex, false)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          
                          {/* Preview images */}
                          {previewImages[index] && previewImages[index].map((preview, previewIndex) => (
                            <div key={`preview-${previewIndex}`} className="relative group">
                              <img
                                src={preview.url}
                                alt="Preview"
                                className="w-full h-20 object-cover rounded-lg border border-blue-300"
                              />
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                                {uploadingImages[index] ? (
                                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                ) : (
                                  <div className="text-xs text-blue-600 font-medium">Preview</div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index, previewIndex, true)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageSelect(index, e.target.files)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          {uploadingImages[index] ? (
                            <>
                              <Loader2 className="h-8 w-8 text-blue-500 mb-2 animate-spin" />
                              <p className="text-sm text-blue-600">Uploading images...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                Click to upload photos
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, GIF up to 10MB each
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              Object.keys(existingReviewData).length > 0 ? 'Update Reviews' : 'Submit Reviews'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;