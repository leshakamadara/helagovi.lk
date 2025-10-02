# Card Preapproval & Save Fix

## Date: October 2, 2025

---

## 🐛 Issues Fixed

### 1. **Hardcoded User ID Problem**
   - **Problem**: CardManagementPage and addCard.jsx were using hardcoded `userId = "635"` 
   - **Impact**: Cards were being saved to wrong user, not to logged-in user
   - **Fixed**: Now uses `user._id` from AuthContext

### 2. **Wrong Notify URL**
   - **Problem**: `notify_url` was set to `https://www.helagovi.lk/api/payments/notify` which goes to frontend
   - **Impact**: PayHere webhook couldn't reach backend to save card
   - **Fixed**: Changed to `https://helagovi-lk.onrender.com/api/payments/notify` (actual backend URL)

### 3. **Wrong Return URLs**
   - **Problem**: `return_url` and `cancel_url` pointed to `/success` and `/cancel`
   - **Impact**: User redirected to wrong pages after preapproval
   - **Fixed**: Changed to `/card-preapproval-success` and `/card-preapproval-cancel`

### 4. **Missing Authentication Check**
   - **Problem**: No check if user is logged in before accessing card pages
   - **Impact**: Could cause errors or save to wrong user
   - **Fixed**: Added user authentication checks with redirect to login

### 5. **Poor Logging**
   - **Problem**: No visibility into what's happening during card save
   - **Impact**: Hard to debug when cards don't save
   - **Fixed**: Added comprehensive logging to notify endpoint

---

## 📝 Changes Made

### Frontend Files

#### 1. `frontend/src/pages/payments/CardManagementPage.jsx`
```javascript
// ❌ Before:
const SESSION_USER_ID = "635";

// ✅ After:
import { useAuth } from '../../context/AuthContext';
const { user } = useAuth();
const SESSION_USER_ID = user?._id || user?.id;

// Added authentication check:
useEffect(() => {
  if (!user) {
    showNotification("Please log in to manage payment cards", "error");
    setTimeout(() => navigate('/login'), 2000);
    return;
  }
  fetchCards();
}, [user, navigate]);
```

#### 2. `frontend/src/pages/payments/addCard.jsx`
```javascript
// ❌ Before:
const params = new URLSearchParams(window.location.search);
const SuserId = params.get("userId");
const response = await fetch("http://localhost:5001/api/payments/preapprove", {...});

// ✅ After:
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/axios";

const { user } = useAuth();

// Pre-fill form with user data
useEffect(() => {
  if (!user) {
    setMessage("Please log in to add a card");
    setTimeout(() => navigate('/login'), 2000);
    return;
  }
  setFirstName(user.firstName || "");
  setLastName(user.lastName || "");
  setEmail(user.email || "");
  setPhone(user.phone || "");
}, [user, navigate]);

// Use actual user ID
const response = await api.post("/payments/preapprove", {
  userId: user._id || user.id,
  // ...other fields
});
```

#### 3. `frontend/src/pages/payments/CardPreapprovalSuccess.jsx`
```javascript
// ❌ Before:
const handleContinue = () => {
  navigate('/saveCard');
};

// ✅ After:
const handleContinue = () => {
  navigate('/card-management');
};
```

### Backend Files

#### 1. `backend/src/controllers/PaymentGatewayController.js`

**Fixed notify_url and return URLs:**
```javascript
// ❌ Before:
const params = {
  merchant_id: MERCHANT_ID,
  return_url: `${PUBLIC_URL}/success`,
  cancel_url: `${PUBLIC_URL}/cancel`,
  notify_url: `${BACKEND_WEBHOOK_URL}/api/payments/notify`,
  // ...
};

// ✅ After:
const params = {
  merchant_id: MERCHANT_ID,
  return_url: `${PUBLIC_URL}/card-preapproval-success`,
  cancel_url: `${PUBLIC_URL}/card-preapproval-cancel`,
  notify_url: `https://helagovi-lk.onrender.com/api/payments/notify`,
  // ...
};
```

**Enhanced notify endpoint with comprehensive logging:**
```javascript
export async function notify(req, res) {
  const body = req.body;
  console.log("="
.repeat(60));
  console.log("📥 PayHere Notify Webhook Received");
  console.log("="
.repeat(60));
  console.log("Request body:", JSON.stringify(body, null, 2));
  
  try {
    const verified = verifyMd5(body);
    console.log("🔐 MD5 Verification:", verified ? "✅ PASSED" : "❌ FAILED");
    
    // ... detailed logging for each step
    
    if (verified && body.status_code === "2" && body.customer_token && body.custom_1) {
      console.log("✅ All conditions met, proceeding to save card...");
      // ... save card logic with logging
    }
  } catch (err) {
    console.error("❌ Notify error:", err.message);
    console.error("Stack trace:", err.stack);
  }
}
```

---

## 🔍 How Card Preapproval Works

### Flow Diagram

```
User (logged in)
    ↓
[Card Management Page]
    ↓
Click "Add Card"
    ↓
[addCard Page]
    ↓
Fill form → Click "Preapprove Card"
    ↓
Frontend sends to: /api/payments/preapprove
    {
      userId: user._id,
      first_name, last_name, email, phone
    }
    ↓
Backend creates hash and returns PayHere params
    ↓
Frontend submits form to: https://sandbox.payhere.lk/pay/preapprove
    ↓
User enters card details on PayHere page
    ↓
PayHere processes preapproval
    ↓
PayHere sends webhook to: https://helagovi-lk.onrender.com/api/payments/notify
    {
      status_code: "2",
      customer_token: "...",
      custom_1: userId,
      card_holder_name: "...",
      card_no: "****1234",
      method: "VISA",
      card_expiry: "12/26"
    }
    ↓
Backend verifies MD5 signature
    ↓
Backend saves card to database (SavedCard model)
    {
      userId: custom_1,
      token: customer_token,
      card_holder_name,
      card_no,
      method,
      expiry_month,
      expiry_year
    }
    ↓
PayHere redirects user to: /card-preapproval-success
    ↓
[CardPreapprovalSuccess Page]
    ↓
User clicks "View Saved Cards"
    ↓
[Card Management Page] - Card now visible!
```

---

## 🧪 Testing Steps

### 1. Login First
```
1. Go to /login
2. Login with your account
3. Verify you're logged in (check user object in console)
```

### 2. Add a Card
```
1. Go to /card-management
2. Click "Add Card" button
3. Fill in the form (should be pre-filled with your user data)
4. Click "Preapprove Card"
5. You'll be redirected to PayHere sandbox
```

### 3. Complete PayHere Preapproval
```
Use these test card details:
- Card Number: 5555555555554444 (Mastercard)
- Expiry: 12/26
- CVV: 123
- Card Holder: Your Name

Click "Pay Now" on PayHere
```

### 4. Monitor Backend Logs
```
You should see in your backend terminal:
📥 PayHere Notify Webhook Received
============================================================
Request body: {
  "merchant_id": "1232059",
  "order_id": "",
  "payhere_amount": "35.00",
  "payhere_currency": "LKR",
  "status_code": "2",
  "method": "MASTER",
  "card_holder_name": "Your Name",
  "card_no": "************4444",
  "card_expiry": "12/26",
  "customer_token": "59AFEE022CC69CA39D325E1B59130862",
  "custom_1": "your-user-id",
  ...
}
🔐 MD5 Verification: ✅ PASSED
Status Code: 2
Customer Token: 59AFEE022CC69CA39D325E1B59130862
User ID (custom_1): your-user-id
✅ All conditions met, proceeding to save card...
💾 Saving new card to database...
✅ Card saved successfully!
```

### 5. Verify Card is Saved
```
1. After PayHere completes, you'll be redirected to /card-preapproval-success
2. Click "View Saved Cards"
3. You should see your card in the Card Management Page
4. The card will have:
   - Card number (last 4 digits)
   - Card holder name
   - Expiry date
   - Card type (VISA/MASTER/etc)
```

---

## 🚨 Troubleshooting

### Issue: Card Shows as Approved but Not Appearing in Card Management

**Check 1: Backend Logs**
```bash
# Check if webhook was received:
grep "PayHere Notify Webhook" backend.log

# If you see the webhook:
- Check if MD5 verification passed
- Check if status_code is "2"
- Check if userId (custom_1) is present
```

**Check 2: Database**
```javascript
// In MongoDB, check SavedCard collection:
db.savedcards.find({ userId: "your-user-id" })

// If card exists, problem is in frontend fetch
// If card doesn't exist, problem is in backend save
```

**Check 3: User ID Mismatch**
```javascript
// In browser console on Card Management Page:
console.log("Current user:", user);
console.log("User ID being used:", user?._id || user?.id);

// This should match the userId in the database card
```

### Issue: Webhook Not Received

**Possible Causes:**
1. **Wrong notify_url** - Check it's `https://helagovi-lk.onrender.com/api/payments/notify`
2. **Backend not accessible** - Render.com server might be sleeping
3. **PayHere sandbox issue** - Check PayHere dashboard for webhook logs

**Fix:**
```javascript
// Wake up your Render backend first:
curl https://helagovi-lk.onrender.com/api/health

// Then try adding card again
```

### Issue: MD5 Verification Failed

**Cause:** Merchant Secret mismatch

**Fix:**
```bash
# Verify your credentials in .env:
PAYHERE_MERCHANT_SECRET="MjE3Njk1NDAyNTEwNjY0Mjc4MzIzNDQxNTIwMTYzNTU4MTk2NjA2"

# This should match your PayHere sandbox dashboard
```

---

## 📊 Expected Database Structure

After successful preapproval, card should be saved as:

```javascript
{
  _id: ObjectId("..."),
  userId: "675a1234567890abcdef1234",  // Your actual user ID
  token: "59AFEE022CC69CA39D325E1B59130862",  // PayHere customer token
  orderId: "",  // Empty for preapproval
  card_holder_name: "JOHN DOE",
  card_no: "************4444",
  method: "MASTER",
  expiry_month: 12,
  expiry_year: 2026,
  createdAt: "2025-10-02T...",
  updatedAt: "2025-10-02T..."
}
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ User is logged in before accessing card pages
2. ✅ Form on addCard page is pre-filled with user data
3. ✅ Backend logs show "📥 PayHere Notify Webhook Received"
4. ✅ Backend logs show "✅ Card saved successfully!"
5. ✅ Card appears in Card Management Page immediately after redirect
6. ✅ Card has correct user ID in database

---

## 🔐 Security Notes

1. **User ID Protection**: Now using authenticated user ID instead of URL parameter
2. **Authentication Required**: All card operations require login
3. **MD5 Verification**: PayHere responses are verified before saving
4. **Token Security**: Customer tokens are stored securely in database
5. **Webhook Endpoint**: Only accepts POST requests from PayHere

---

## 📝 API Endpoints

### POST /api/payments/preapprove
**Purpose**: Initialize card preapproval
**Auth**: Required
**Body**:
```json
{
  "userId": "user-id-from-auth",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "address": "",
  "city": ""
}
```

### POST /api/payments/notify
**Purpose**: Webhook to receive preapproval confirmation from PayHere
**Auth**: None (verified via MD5)
**Body**: Sent by PayHere with payment details

### GET /api/payments/card/:userId
**Purpose**: Fetch all saved cards for a user
**Auth**: Required
**Response**:
```json
[
  {
    "_id": "...",
    "userId": "...",
    "token": "...",
    "card_holder_name": "JOHN DOE",
    "card_no": "************4444",
    "method": "MASTER",
    "expiry_month": 12,
    "expiry_year": 2026
  }
]
```

---

## 🎯 Next Steps

1. **Test the complete flow** with a new card
2. **Verify cards appear** in Card Management Page
3. **Test charging** a saved card on ChargePage
4. **Monitor logs** for any issues
5. **Update production** when ready

