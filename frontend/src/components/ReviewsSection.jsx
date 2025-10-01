import React, { useState, useEffect } from 'react';
import { Star, Upload, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

const ReviewsSection = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterRating, setFilterRating] = useState('');

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });

  const [editingReview, setEditingReview] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  // Image lightbox state
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageGallery, setImageGallery] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated && user?.role === 'buyer') {
      checkReviewEligibility();
    }
  }, [productId, filterRating]);

  const fetchReviews = async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (filterRating) {
        params.append('rating', filterRating);
      }

      const response = await api.get(`/reviews/product/${productId}?${params}`);
      
      if (response.data.success) {
        const newReviews = response.data.data.reviews;
        const stats = response.data.data.stats;
        const pagination = response.data.data.pagination;

        if (append) {
          setReviews(prev => [...prev, ...newReviews]);
        } else {
          setReviews(newReviews);
        }
        
        setReviewStats(stats);
        setHasMore(pagination.hasNextPage);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await api.get(`/reviews/eligibility/${productId}`);
      if (response.data.success) {
        setCanReview(response.data.data.canReview);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!reviewForm.title.trim()) {
      toast.error('Please enter a review title');
      return;
    }
    if (reviewForm.title.trim().length < 5) {
      toast.error('Title must be at least 5 characters long');
      return;
    }
    if (reviewForm.title.trim().length > 100) {
      toast.error('Title must be less than 100 characters');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please enter your review');
      return;
    }
    if (reviewForm.comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }
    if (reviewForm.comment.trim().length > 1000) {
      toast.error('Review must be less than 1000 characters');
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData = {
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        images: reviewForm.images
      };
      
      const endpoint = editingReview 
        ? `/reviews/${editingReview._id}`
        : `/reviews/product/${productId}`;
      
      const method = editingReview ? 'put' : 'post';
      
      console.log('Submitting review:', reviewData);
      const response = await api[method](endpoint, reviewData);
      
      if (response.data.success) {
        toast.success(editingReview ? 'Review updated successfully' : 'Review submitted successfully');
        setShowReviewForm(false);
        setEditingReview(null);
        setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        setPreviewImages([]);
        fetchReviews(); // Refresh reviews
        if (!editingReview) {
          setCanReview(false); // User can no longer review this product
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      if (response.data.success) {
        toast.success('Review deleted successfully');
        fetchReviews(); // Refresh reviews
        setCanReview(true); // User can now review again
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleHelpfulVote = async (reviewId, vote) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`, { vote });
      if (response.data.success) {
        toast.success('Vote recorded');
        fetchReviews(); // Refresh to show updated counts
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  const handleImageSelect = (files) => {
    if (!files || files.length === 0) return;

    // Create preview URLs for selected files
    const selectedFiles = Array.from(files);
    const previewUrls = selectedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isPreview: true
    }));

    // Add previews to state
    setPreviewImages(prev => [...prev, ...previewUrls]);

    // Upload images to Cloudinary
    handleImageUpload(selectedFiles);
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);

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
        setPreviewImages(prev => prev.filter(img => !img.isPreview));

        setReviewForm(prev => ({
          ...prev,
          images: [...prev.images, ...response.data.data.images]
        }));
        toast.success('Images uploaded successfully!');
      } else {
        // Remove preview images on failure
        setPreviewImages(prev => prev.filter(img => !img.isPreview));
        toast.error(response.data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      // Remove preview images on error
      setPreviewImages(prev => prev.filter(img => !img.isPreview));
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (imageIndex, isPreview = false) => {
    if (isPreview) {
      // Remove preview image and revoke URL to prevent memory leaks
      setPreviewImages(prev => {
        const imageToRemove = prev[imageIndex];
        if (imageToRemove && imageToRemove.url) {
          URL.revokeObjectURL(imageToRemove.url);
        }
        return prev.filter((_, i) => i !== imageIndex);
      });
    } else {
      // Remove uploaded image
      setReviewForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== imageIndex)
      }));
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Revoke all preview URLs to prevent memory leaks
      previewImages.forEach(preview => {
        if (preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, []);

  // Image lightbox functions
  const openImageModal = (images, index) => {
    setImageGallery(images);
    setCurrentImageIndex(index);
    setSelectedImage(images[index]);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageGallery([]);
    setCurrentImageIndex(0);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const navigateImage = (direction) => {
    if (imageGallery.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentImageIndex + 1 >= imageGallery.length ? 0 : currentImageIndex + 1;
    } else {
      newIndex = currentImageIndex - 1 < 0 ? imageGallery.length - 1 : currentImageIndex - 1;
    }
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(imageGallery[newIndex]);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Zoom functions
  const handleZoom = (delta) => {
    setZoomLevel(prevZoom => {
      const newZoom = Math.max(0.5, Math.min(5, prevZoom + delta));
      if (newZoom <= 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Mouse drag functions
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    handleZoom(delta);
  };

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedImage) return;
      
      switch (event.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
        case '=':
        case '+':
          handleZoom(0.2);
          break;
        case '-':
        case '_':
          handleZoom(-0.2);
          break;
        case '0':
          resetZoom();
          break;
        default:
          break;
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, currentImageIndex, imageGallery, isDragging, dragStart, imagePosition]);

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const total = reviewStats.totalReviews;
    if (total === 0) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewStats.ratingDistribution[rating] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderReviewForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {editingReview ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            {renderStars(reviewForm.rating, true, (rating) => 
              setReviewForm(prev => ({ ...prev, rating }))
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={reviewForm.title}
              onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
              maxLength={100}
              required
            />
            <div className="text-xs text-gray-500">
              {reviewForm.title.length}/100 characters (minimum 5 required)
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your thoughts about this product..."
              rows={4}
              maxLength={1000}
              required
            />
            <div className="text-xs text-gray-500">
              {reviewForm.comment.length}/1000 characters (minimum 10 required)
            </div>
          </div>

          {/* Image upload section */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            
            {/* Display uploaded and preview images */}
            {((reviewForm.images && reviewForm.images.length > 0) || previewImages.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {/* Uploaded images */}
                {reviewForm.images && reviewForm.images.map((image, imageIndex) => (
                  <div key={`uploaded-${imageIndex}`} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imageIndex, false)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Preview images */}
                {previewImages.map((preview, previewIndex) => (
                  <div key={`preview-${previewIndex}`} className="relative group">
                    <img
                      src={preview.url}
                      alt="Preview"
                      className="w-full h-20 object-cover rounded-lg border border-blue-300"
                    />
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      {uploadingImages ? (
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : (
                        <div className="text-xs text-blue-600 font-medium">Preview</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(previewIndex, true)}
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
                onChange={(e) => handleImageSelect(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {uploadingImages ? (
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

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowReviewForm(false);
                setEditingReview(null);
                setReviewForm({ rating: 5, title: '', comment: '', images: [] });
                setPreviewImages([]);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderReview = (review) => {
    // Check ownership - user can edit their own reviews, admins can edit any review
    const isOwner = user?._id && review.buyer?._id && 
                   (String(user._id) === String(review.buyer._id) || user?.role === 'admin');
    const reviewDate = new Date(review.createdAt).toLocaleDateString();

    return (
      <Card key={review._id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={review.buyer.avatar} />
                <AvatarFallback>
                  {review.buyer.firstName?.[0]}{review.buyer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {review.buyer.firstName} {review.buyer.lastName}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                  {renderStars(review.rating)}
                  <span>•</span>
                  <span>{reviewDate}</span>
                  {review.isVerifiedPurchase && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        Verified Purchase
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isAuthenticated && isOwner && (
              <div className="flex gap-2 flex-shrink-0 self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingReview(review);
                    setReviewForm({
                      rating: review.rating,
                      title: review.title,
                      comment: review.comment,
                      images: review.images || []
                    });
                    setShowReviewForm(true);
                  }}
                  className="text-xs sm:text-sm"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">{review.title}</h4>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          </div>

          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openImageModal(review.images, index)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpfulVote(review._id, 'helpful')}
                className="text-gray-600 hover:text-green-600 text-xs sm:text-sm"
              >
                Helpful ({review.isHelpful?.helpfulCount || 0})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpfulVote(review._id, 'not-helpful')}
                className="text-gray-600 hover:text-red-600 text-xs sm:text-sm"
              >
                Not Helpful ({review.isHelpful?.notHelpfulCount || 0})
              </Button>
            </div>
          </div>

          {review.farmerResponse && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="mb-2">
                <span className="font-medium text-sm text-green-600">Response from Farmer</span>
              </div>
              <p className="text-sm text-gray-700">{review.farmerResponse.comment}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            {isAuthenticated && user?.role === 'buyer' && canReview && (
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewStats.totalReviews > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(reviewStats.averageRating))}
                <p className="text-gray-600 mt-2">
                  Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium mb-3">Rating Breakdown</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && renderReviewForm()}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Reviews ({reviewStats.totalReviews})</h3>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="space-y-4">
            {reviews.map(renderReview)}
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => fetchReviews(page + 1, true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Reviews'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Reviews Message */}
      {!loading && reviews.length === 0 && reviewStats.totalReviews === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            <p className="text-lg">No reviews available for this product yet.</p>
            <p className="text-sm mt-2">Be the first to share your experience!</p>
          </CardContent>
        </Card>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 flex items-center justify-center"
          onClick={closeImageModal}
          style={{ margin: 0, padding: 0 }}
        >
          <div className="relative w-full h-full overflow-hidden" style={{ margin: 0, padding: 0 }}>
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom(0.2);
                }}
                className="bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
                title="Zoom In (+)"
              >
                <span className="text-xl font-bold leading-none">+</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoom(-0.2);
                }}
                className="bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
                title="Zoom Out (-)"
              >
                <span className="text-xl font-bold leading-none">−</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetZoom();
                }}
                className="bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all text-xs"
                title="Reset Zoom (0)"
              >
                1:1
              </button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>

            {/* Navigation buttons */}
            {imageGallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image Container */}
            <div 
              className="w-full h-full flex items-center justify-center overflow-hidden"
              onWheel={handleWheel}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || 'Review image'}
                className={`max-w-none rounded-lg transition-transform duration-200 ${
                  zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'
                } ${isDragging ? 'cursor-grabbing' : ''}`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  maxWidth: zoomLevel <= 1 ? '90vw' : 'none',
                  maxHeight: zoomLevel <= 1 ? '90vh' : 'none',
                }}
                onMouseDown={handleMouseDown}
                onClick={(e) => {
                  e.stopPropagation();
                  if (zoomLevel === 1) {
                    handleZoom(1);
                  }
                }}
                draggable={false}
              />
            </div>

            {/* Image counter */}
            {imageGallery.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {imageGallery.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;