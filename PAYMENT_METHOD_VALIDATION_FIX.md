# Payment Method Validation Fix

## Problem
Order creation was failing after successful card charge with error:
```
Payment successful (ID: 320032526532), but order creation failed: Validation errors
```

## Root Cause

The backend validation in `orderRoutes.js` was rejecting the payment method `'saved_card'`.

### Backend Validation (Before Fix)
```javascript
body('paymentMethod')
  .optional()
  .isIn(['cash_on_delivery', 'bank_transfer', 'mobile_payment', 'credit_card'])
  .withMessage('Invalid payment method'),
```

### Frontend Sending
```javascript
const orderPayload = {
  ...
  paymentMethod: 'saved_card',  // ❌ Not in allowed list!
  ...
};
```

## Solution

Added `'saved_card'` to the list of valid payment methods:

```javascript
body('paymentMethod')
  .optional()
  .isIn(['cash_on_delivery', 'bank_transfer', 'mobile_payment', 'credit_card', 'saved_card'])
  .withMessage('Invalid payment method'),
```

## Console Error Details

The error showed:
```javascript
Creating order with data: {
  items: Array(1),
  deliveryAddress: {...},
  paymentMethod: 'saved_card',  // This was the problem
  paymentStatus: 'paid',
  transactionId: 320032526532,
  notes: ''
}

POST https://helagovi-lk.onrender.com/api/orders 400 (Bad Request)

API error details: {
  success: false,
  message: 'Validation errors',
  errors: Array(1)  // paymentMethod validation failed
}
```

## Flow Now Works

```
1. User charges saved card
   → POST /api/payments/charge → Success ✅

2. Create order with paymentMethod: 'saved_card'
   → POST /api/orders → Success ✅ (now accepts 'saved_card')

3. Order created in database
   → Order appears in "My Orders" ✅

4. Cart cleared
   → DELETE /api/cart → Success ✅

5. Navigate to success page
   → With complete order data ✅
```

## Valid Payment Methods (Updated)

| Method | Description | Use Case |
|--------|-------------|----------|
| `cash_on_delivery` | Pay when receiving order | Default option |
| `bank_transfer` | Bank transfer payment | Manual payment |
| `mobile_payment` | Mobile wallet payment | Digital payments |
| `credit_card` | PayHere checkout | Regular checkout |
| `saved_card` ✅ | PayHere saved card charge | Card charge flow |

## Testing

After deployment (1-2 minutes), test:
1. Buy a product
2. Fill delivery info
3. Click "Pay with Saved Card"
4. Charge the card
5. ✅ Order should be created successfully
6. ✅ Order appears in "My Orders" dashboard

## Files Changed

- `backend/src/routes/orderRoutes.js` - Added 'saved_card' to validation

## Related Issues

This fix resolves:
- ❌ "Validation errors" message after successful payment
- ❌ Orders not appearing in dashboard after card charge
- ❌ 400 Bad Request on POST /api/orders

## Notes

- Payment method validation is case-sensitive
- The validation is in the express-validator middleware
- Other payment methods remain unchanged
- This is a backend-only fix (no frontend changes needed)
