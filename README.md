<div align="center">
  <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759143086/Logo_uf3yae.png" alt="Helagovi.lk Logo" width="300"/>
</div>



 ⚠️ **Disclaimer**  
 - This is a **Academic Project** created for educational purposes only.  
 - The name *Helagovi* is inspired by the Sinhala word *Hela* (meaning *Ceylon*).  
 - It was chosen out of admiration for local digital innovations.  
 - It is used here in a purely academic context, with no commercial intent.



# ✨ When Ideas Meet Reality  


<div align="center">
  
[![Website](https://img.shields.io/badge/Website-helagovi.lk-success?style=for-the-badge)](https://www.helagovi.lk)

</div>

<div align="center">
  <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759142371/Screenshot_2025-09-29_at_16.06.52_limfme.png" alt="Website Desktop" width="100%"/>
  <br/><br/>
  <img src="https://res.cloudinary.com/dckoipgrs/image/upload/v1759142370/IMG_82A811E6F22A-1_nk9hkw.jpg" alt="Website Mobile" width="500"/>
</div>

---



## 🚀 Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas account
- Cloudinary account
- Upstash Redis account (optional)
- PayHere merchant account

### Step 1: Clone the Repository

```bash
git clone https://github.com/leshakamadara/helagovi.lk.git
cd helagovi.lk
```

### Step 2: Environment Configuration

Create a `.env` file in the **backend** folder with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=YOUR_MONGO_URI

# Authentication
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRE=12h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUD_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUD_API_SECRET

# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=YOUR_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN=YOUR_REDIS_REST_TOKEN

# PayHere Payment Gateway
PAYHERE_MERCHANT_ID=YOUR_PAYHERE_MERCHANT_ID
PAYHERE_MERCHANT_SECRET=YOUR_PAYHERE_MERCHANT_SECRET
PAYHERE_APP_ID=YOUR_PAYHERE_APP_ID
PAYHERE_APP_SECRET=YOUR_PAYHERE_APP_SECRET
FORCE_PAYHERE_SANDBOX=true

# Frontend URLs
PUBLIC_URL=https://www.helagovi.lk
FRONTEND_URL=https://www.helagovi.lk
BACKEND_WEBHOOK_URL=https://www.helagovi.lk
```

### Step 3: Install Dependencies

#### Backend Dependencies

```bash
cd backend
npm install
cd ..
```

#### Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 4: Run the Application

You can run both backend and frontend simultaneously by opening two terminal windows:

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm run dev
```

---

## 🛠️ Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Redis (Upstash)

### Frontend
- React.js
-  Tailwind CSS/ShadCN

### Third-Party Services
- **Cloudinary** - Image upload and management
- **PayHere** - Payment gateway integration
- **Upstash Redis** - Caching layer (optional)

---

## 📦 Key Features

### Database
- MongoDB Atlas for production data storage
- Ensure credentials match production accounts

### Image Management
- Cloudinary for image uploads and optimization
- Configure API keys in environment variables

### Caching (Optional)
- Upstash Redis for caching sessions and frequent queries
- Improves application performance

### Payment Processing
- PayHere integration with sandbox mode support
- Set `FORCE_PAYHERE_SANDBOX=true` for testing
- Configure merchant IDs, app secrets, and webhook URLs
- Frontend redirects should match `FRONTEND_URL`

---

## 📧 Contact

For questions or feedback about this academic project, please open an issue in the repository.

---
