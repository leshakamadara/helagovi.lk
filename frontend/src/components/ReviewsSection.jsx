import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
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
    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const endpoint = editingReview 
        ? `/reviews/${editingReview._id}`
        : `/reviews/product/${productId}`;
      
      const method = editingReview ? 'put' : 'post';
      
      const response = await api[method](endpoint, reviewForm);
      
      if (response.data.success) {
        toast.success(editingReview ? 'Review updated successfully' : 'Review submitted successfully');
        setShowReviewForm(false);
        setEditingReview(null);
        setReviewForm({ rating: 5, title: '', comment: '', images: [] });
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
    const isOwner = user?._id === review.buyer._id;
    const reviewDate = new Date(review.createdAt).toLocaleDateString();

    return (
      <Card key={review._id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.buyer.avatar} />
                <AvatarFallback>
                  {review.buyer.firstName?.[0]}{review.buyer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {review.buyer.firstName} {review.buyer.lastName}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {renderStars(review.rating)}
                  <span>•</span>
                  <span>{reviewDate}</span>
                  {review.isVerifiedPurchase && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        Verified Purchase
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
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
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteReview(review._id)}
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
            <div className="flex gap-2 mb-4">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpfulVote(review._id, 'helpful')}
                className="text-gray-600 hover:text-green-600"
              >
                Helpful ({review.isHelpful?.helpfulCount || 0})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpfulVote(review._id, 'not-helpful')}
                className="text-gray-600 hover:text-red-600"
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
    </div>
  );
};

export default ReviewsSection;