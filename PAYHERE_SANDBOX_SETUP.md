# PayHere Sandbox Setup Guide

## ✅ Changes Made (October 2, 2025)

### 1. Frontend - Updated to Sandbox SDK
Fixed both frontend files to use the sandbox PayHere JavaScript SDK:

- `frontend/src/components/CheckoutButton.jsx` → Now uses `https://sandbox.payhere.lk/lib/payhere.js`
- `frontend/src/pages/payments/billingHistory.jsx` → Now uses `https://sandbox.payhere.lk/lib/payhere.js`

### 2. Backend - Removed Custom Headers
Fixed `backend/src/controllers/PaymentGatewayController.js`:

- ✅ Removed `Origin` and `Referer` headers from charge API call
- ✅ Added better logging for debugging
- ✅ Improved error handling

**Why?** In sandbox mode, PayHere doesn't check domain whitelist like in live mode. Sending custom headers was causing conflicts.

---

## 🔧 Current Configuration

### Environment Variables (`.env`)
```env
PAYHERE_MERCHANT_ID="1232059"
PAYHERE_MERCHANT_SECRET="MjE3Njk1NDAyNTEwNjY0Mjc4MzIzNDQxNTIwMTYzNTU4MTk2NjA2"
PAYHERE_APP_ID="4OVyIPRAfqq4JFnJsgjrNJ3D0"
PAYHERE_APP_SECRET="8m37JU8FMHr48febsV1al94ZJ45SNZyPX8LTWkYlVIrC"
```

### API Endpoints Used
- OAuth Token: `https://sandbox.payhere.lk/merchant/v1/oauth/token`
- Charge API: `https://sandbox.payhere.lk/merchant/v1/payment/charge`
- Preapprove: `https://sandbox.payhere.lk/pay/preapprove`

---

## 📋 Troubleshooting Checklist

### If "Access denied" error persists:

1. **Verify Credentials in PayHere Sandbox Dashboard**
   - Go to: https://sandbox.payhere.lk/
   - Navigate to: Business Apps → Your App
   - Confirm:
     - App ID matches: `4OVyIPRAfqq4JFnJsgjrNJ3D0`
     - App Secret matches your `.env` file
     - Merchant ID matches: `1232059`

2. **Check Business App Status**
   - Make sure your Business App is **approved/active** in sandbox
   - Status should not be "pending" or "disabled"

3. **Test OAuth Token Manually**
   Run this curl command to test if your credentials work:
   ```bash
   APP_ID="4OVyIPRAfqq4JFnJsgjrNJ3D0"
   APP_SECRET="8m37JU8FMHr48febsV1al94ZJ45SNZyPX8LTWkYlVIrC"
   
   AUTH=$(echo -n "$APP_ID:$APP_SECRET" | base64)
   
   curl -X POST https://sandbox.payhere.lk/merchant/v1/oauth/token \
     -H "Authorization: Basic $AUTH" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials"
   ```
   
   **Expected Response:**
   ```json
   {
     "access_token": "cb5c47fd-741c-489a-b69e-fd73155ca34e",
     "token_type": "bearer",
     "expires_in": 599,
     "scope": "SANDBOX"
   }
   ```

4. **Domain Whitelist (Optional for Sandbox)**
   Even though sandbox is supposed to be lenient, add these to be safe:
   - `https://www.helagovi.lk`
   - `https://helagovi-lk.onrender.com`
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `http://localhost:5001`

5. **Check Backend Logs**
   After clicking "Charge Card", check your backend terminal for:
   - ✅ "Requesting PayHere access token..."
   - ✅ "Access token received: { scope: 'SANDBOX' }"
   - ✅ "Calling PayHere charge API with body..."
   - ❌ Look for any error messages

---

## 🧪 Testing Flow

### Step 1: Preapprove a Card (Save Card)
1. Go to your frontend
2. Navigate to card management
3. Add a new card using sandbox test card:
   - **Card Number**: `5555555555554444` (Mastercard)
   - **Expiry**: Any future date (e.g., `12/26`)
   - **CVV**: `123`
   - **Name**: Any name

### Step 2: Charge the Card
1. Go to `/ChargePage`
2. Select the saved card
3. Click "Charge Card"
4. Check backend logs for detailed output

---

## 🔍 What the Backend Logs Should Show

### Success Case:
```
Requesting PayHere access token...
Access token received: { token_type: 'bearer', expires_in: 599, scope: 'SANDBOX' }
Calling PayHere charge API with body: {
  type: 'PAYMENT',
  order_id: 'ORD-1234567890',
  amount: 323.99,
  currency: 'LKR',
  customer_token: '59AFEE022C...'
}
PayHere charge response: { status: 1, msg: 'Automatic payment charged successfully', data: {...} }
✅ Payment successful
```

### Error Case:
```
❌ Charging error: {
  message: 'Request failed with status code 403',
  status: 403,
  statusText: 'Forbidden',
  data: { msg: 'Access denied for the domain' }
}
```

---

## 🚀 Next Steps After Fixing

1. **Restart Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Restart Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the Payment Flow**
   - Clear browser cache if needed
   - Try the charge again
   - Monitor backend logs

---

## 📝 Notes

- **Sandbox vs Live**: Never mix sandbox credentials with live endpoints
- **Domain Whitelist**: Only applies to **LIVE** environment for the charging API
- **Customer Token**: Must be obtained via preapproval first
- **Access Token**: Expires in 599 seconds (about 10 minutes)

---

## 🆘 If Still Failing

Check these common issues:

1. **Wrong Credentials**: APP_ID or APP_SECRET is incorrect
2. **Business App Not Active**: App needs to be approved in sandbox dashboard
3. **Invalid Customer Token**: The saved card token might be expired or invalid
4. **Amount Format**: Make sure amount is a number, not a string
5. **Backend Not Running**: Verify backend is accessible at port 5001

---

## 📧 PayHere Support

If the issue persists after all checks:
- Email: support@payhere.lk
- Mention you're using **Sandbox** environment
- Provide your Merchant ID: `1232059`
- Include the error message from logs

