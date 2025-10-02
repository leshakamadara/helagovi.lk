# 🔧 PayHere Sandbox Charge Page - Fixed Issues

## Date: October 2, 2025

---

## ✅ Issues Fixed

### 1. **Sandbox vs Live Environment Mismatch**
   - **Problem**: Frontend was loading LIVE PayHere SDK while backend was using SANDBOX API
   - **Fixed**: Updated all frontend files to use sandbox SDK
   - **Files Changed**:
     - `frontend/src/components/CheckoutButton.jsx`
     - `frontend/src/pages/payments/billingHistory.jsx`

### 2. **Custom Headers Causing "Access Denied"**
   - **Problem**: Backend was sending custom `Origin` and `Referer` headers that conflicted with PayHere's domain validation
   - **Fixed**: Removed custom headers for sandbox environment
   - **File Changed**: `backend/src/controllers/PaymentGatewayController.js`

### 3. **Hardcoded User ID**
   - **Problem**: ChargePage was using hardcoded `userId = "635"` instead of actual logged-in user
   - **Fixed**: Now uses `user._id` from AuthContext
   - **File Changed**: `frontend/src/pages/payments/ChargePage.jsx`

### 4. **Missing Error Handling**
   - **Problem**: Errors weren't properly logged or displayed to user
   - **Fixed**: Added comprehensive error logging and user feedback
   - **Files Changed**: Both frontend ChargePage and backend controller

---

## 📋 Changes Summary

### Frontend (`ChargePage.jsx`)
```javascript
// ✅ Before:
const userId = "635";

// ✅ After:
import { useAuth } from "../../context/AuthContext";
const { user } = useAuth();
const userId = user?._id || user?.id;
```

**Additional improvements:**
- Added login redirect if user not authenticated
- Better validation before charging
- Improved error messages
- Enhanced console logging for debugging

### Backend (`PaymentGatewayController.js`)
```javascript
// ✅ Before:
headers: {
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
  "Origin": PUBLIC_URL,
  "Referer": PUBLIC_URL,
  "User-Agent": "helagovi.lk-backend/1.0"
}

// ✅ After:
headers: {
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json"
}
```

**Additional improvements:**
- Better logging at each step
- Token info logging (scope, expires_in)
- Detailed error responses
- Success/failure flags in response

---

## 🧪 Testing Steps

### Step 1: Verify Credentials (Already Done ✅)
```bash
cd backend
./test-payhere-credentials.sh
```
**Result**: ✅ SUCCESS - Credentials are valid, scope is SANDBOX

### Step 2: Restart Servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

### Step 3: Test the Full Flow

1. **Login to your account**
   - Make sure you're logged in with a valid user account
   - Check browser console for user object

2. **Add/Verify Saved Card**
   - Go to card management page
   - Make sure you have at least one saved card
   - Use PayHere sandbox test card if needed:
     - Card: `5555555555554444`
     - Expiry: `12/26`
     - CVV: `123`

3. **Create an Order**
   - Add items to cart
   - Go to checkout
   - Fill in delivery information
   - Click "Pay with Saved Cards"

4. **Charge the Card**
   - You'll be redirected to ChargePage
   - Select a saved card
   - Click "Charge Card"
   - Confirm the payment

5. **Monitor Logs**
   
   **Backend Terminal Should Show:**
   ```
   Fetching cards for userId: [your-user-id]
   Requesting PayHere access token...
   Access token received: { token_type: 'bearer', expires_in: 599, scope: 'SANDBOX' }
   Calling PayHere charge API with body: {
     type: 'PAYMENT',
     order_id: 'ORD-...',
     amount: 323.99,
     currency: 'LKR',
     customer_token: '...'
   }
   PayHere charge response: { status: 1, msg: '...', data: {...} }
   ✅ Payment successful
   ```
   
   **Browser Console Should Show:**
   ```
   Initiating charge with data: {...}
   Charge response: { success: true, ... }
   ```

---

## 🚨 Common Errors & Solutions

### Error: "No preapproved token found"
**Cause**: No saved card found for the user
**Solution**: 
1. Check if you're logged in with the correct user
2. Add a new card via preapproval process
3. Verify card is saved in database

### Error: "Access denied for the domain"
**Cause**: Domain mismatch or wrong environment
**Solution**:
1. ✅ Already fixed - removed custom headers
2. Verify you're using sandbox SDK: `https://sandbox.payhere.lk/lib/payhere.js`
3. Clear browser cache and restart

### Error: "Invalid customer token"
**Cause**: Saved card token is expired or invalid
**Solution**:
1. Delete the saved card from database
2. Re-add the card using preapproval
3. Try charging again

### Error: "User not logged in"
**Cause**: No user in AuthContext
**Solution**:
1. Login to your account
2. Check AuthContext is properly set up
3. Verify token is stored in localStorage

---

## 🔍 Debugging Checklist

If payment still fails, check these in order:

- [ ] Backend server is running on port 5001
- [ ] Frontend is using sandbox SDK (check Network tab)
- [ ] User is logged in (check `user` in console)
- [ ] Saved cards exist for this user (check API response)
- [ ] Backend credentials are valid (run test script)
- [ ] No CORS errors in console
- [ ] PayHere access token has scope: "SANDBOX"
- [ ] Request body has valid customer_token
- [ ] Amount is a valid number > 0

---

## 📊 Expected API Flow

```
1. Frontend: ChargePage loads
   └─> Calls: GET /api/payments/card/{userId}
   └─> Response: Array of saved cards

2. User clicks "Charge Card"
   └─> Frontend: POST /api/payments/charge
   
3. Backend: Receives charge request
   ├─> Validates: userId, cardId, order_id, amount
   ├─> Fetches: SavedCard from database
   ├─> Calls: POST /merchant/v1/oauth/token (PayHere)
   ├─> Receives: access_token (scope: SANDBOX)
   ├─> Calls: POST /merchant/v1/payment/charge (PayHere)
   └─> Returns: Payment result

4. Frontend: Receives response
   ├─> If success (status_code: 2): Navigate to /success
   └─> If failed: Show error message
```

---

## 🎯 Success Indicators

You'll know it's working when you see:

1. ✅ Backend logs show: "Access token received: { scope: 'SANDBOX' }"
2. ✅ Backend logs show: "PayHere charge response: { status: 1, ... }"
3. ✅ Backend logs show: "✅ Payment successful"
4. ✅ Frontend shows: "✅ Payment Successful"
5. ✅ Redirected to `/success` page

---

## 📝 Files Modified

1. `frontend/src/pages/payments/ChargePage.jsx` - Fixed hardcoded userId, added validation
2. `frontend/src/components/CheckoutButton.jsx` - Changed to sandbox SDK
3. `frontend/src/pages/payments/billingHistory.jsx` - Changed to sandbox SDK
4. `backend/src/controllers/PaymentGatewayController.js` - Removed custom headers, better logging

---

## 🔗 Resources

- PayHere Sandbox Dashboard: https://sandbox.payhere.lk/
- PayHere API Documentation: https://support.payhere.lk/api-&-mobile-sdk/
- Test Card Numbers: https://support.payhere.lk/faq/test-card-numbers/

---

## 💡 Next Steps

After successful testing:

1. **Production Setup** (When ready to go live):
   - Create Business App in LIVE PayHere dashboard
   - Update credentials in production .env
   - Change SDK to: `https://www.payhere.lk/lib/payhere.js`
   - Add domain whitelist in live dashboard
   - Update backend endpoints to live URLs

2. **Security Improvements**:
   - Move credentials to secure environment variables
   - Add rate limiting to charge endpoint
   - Implement transaction logging
   - Add webhook verification

3. **User Experience**:
   - Add card nickname feature
   - Show transaction history
   - Add refund functionality
   - Email receipts after successful payment

