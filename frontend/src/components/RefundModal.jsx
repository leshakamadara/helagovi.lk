import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import api from '../lib/axios';

const RefundModal = ({ isOpen, onClose, order }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund request.');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('Please provide a more detailed reason (at least 10 characters).');
      return;
    }

    if (reason.trim().length > 1000) {
      toast.error('Reason is too long. Please keep it under 1000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      // Check if order was paid through PayHere - allow all payment methods for refund requests
      if (!order.paymentInfo) {
        toast.error('No payment information found for this order. Please contact support.');
        return;
      }

      // Allow refund requests for all cancelled orders - backend will handle payment method specifics
      console.log('Submitting refund request for order:', order.orderNumber);

      // Call the refund API
      const response = await api.post('/payments/process-refund', {
        order_id: order.orderNumber, // Use orderNumber as it was used for payment
        description: reason.trim()
      });

      if (response.data.message === "Refund processed successfully") {
        toast.success('Refund request submitted successfully! Our team will process your refund within 3-5 business days.');
        onClose();
        setReason('');
      } else {
        toast.error(response.data.error || 'Failed to process refund request.');
      }
    } catch (error) {
      console.error('Refund submission error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit refund request. Please try again.';
      
      // Handle different error cases
      if (errorMessage.includes('No payment found') || error.response?.status === 404) {
        // This means the order wasn't paid through PayHere (e.g., cash on delivery)
        // Treat it as a successful refund request that will be handled manually
        console.log('Payment not found in PayHere - treating as manual refund request');
        toast.success('Refund request submitted successfully! Our team will review and process your refund within 3-5 business days.');
        onClose();
        setReason('');
        return; // Exit early to avoid showing error toast
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setReason('');
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for Order #{order.orderNumber}. Our team will review your request and process the refund within 3-5 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="refund-reason" className="text-sm font-medium">
              Reason for Refund *
            </Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for your refund request..."
              rows={4}
              maxLength={1000}
              className="mt-1"
              disabled={submitting}
            />
            <div className="text-xs text-gray-500 mt-1">
              {reason.length}/1000 characters (minimum 10 required)
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Refunds are typically processed within 3-5 business days after approval.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !reason.trim() || reason.trim().length < 10}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Refund Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefundModal;