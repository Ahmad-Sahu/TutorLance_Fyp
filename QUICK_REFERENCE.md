# Quick Reference Card - TutorLance Gig System

## File Locations 📁

### Backend
```
backend/
├── models/GigOffer.model.js          ← Offer schema
├── controllers/GigOffer.controller.js ← Business logic
├── routes/GigOffer.route.js          ← API endpoints
├── index.js                           ← (Modified) Routes registered
└── .env                               ← (Modified) Stripe keys
```

### Frontend
```
frontend/src/components/
├── GigNegotiation.jsx                 ← Counter form
├── GigPayment.jsx                     ← Stripe payments
├── GigDelivery.jsx                    ← Delivery/review
├── StudentGigOffers.jsx               ← Offer list
├── StudentGigsPage.jsx                ← Dashboard
└── FreeLancerDashboard.jsx            ← (Modified) Available gigs

frontend/
└── .env.local                         ← (Modified) Stripe key
```

---

## Key Endpoints 🔌

```
POST   /api/v1/gig-offers/:freelancerId/create
GET    /api/v1/gig-offers/gig/:gigId
GET    /api/v1/gig-offers/freelancer/:freelancerId
PUT    /api/v1/gig-offers/:offerId/update-amount
PUT    /api/v1/gig-offers/:offerId/accept
PUT    /api/v1/gig-offers/:offerId/reject
POST   /api/v1/gig-offers/:offerId/payment
PUT    /api/v1/gig-offers/:offerId/deliver
PUT    /api/v1/gig-offers/:offerId/accept-delivery
```

---

## UI Components 🎨

| Component | Purpose | Props | File |
|-----------|---------|-------|------|
| GigNegotiation | Counter offer form | gig, freelancer, onOfferSent | GigNegotiation.jsx |
| GigPayment | Stripe payment | offer, onPaymentSuccess | GigPayment.jsx |
| GigDelivery | Delivery/review | offer, onDeliverySubmit, isFreelancer | GigDelivery.jsx |
| StudentGigOffers | Offers list | gigId, studentId | StudentGigOffers.jsx |

---

## Status Values 🔄

```
pending       ← Negotiating
accepted      ← Both agreed
rejected      ← Offer rejected
delivered     ← Work submitted
completed     ← Work accepted
paid          ← Payment released
```

---

## Amount Negotiation 💰

```
Initial: 5000 PKR (original budget)
[-50]  → 4950 PKR
[+50]  → 5050 PKR
[-50][-50] → 4900 PKR
[+50][+50][+50] → 5150 PKR
```

---

## Payment Flow 💳

```
1. Student enters card → Stripe creates payment intent
2. Amount HELD on card (not charged)
3. Freelancer delivers
4. Student accepts → Stripe confirms payment intent
5. Card CHARGED → Amount transferred to freelancer
```

---

## Database Schema (Simplified) 💾

```javascript
GigOffer {
  gigId: ObjectId,
  freelancerId: ObjectId,
  studentId: ObjectId,
  offeredAmount: Number,
  status: String,
  negotiationHistory: Array,
  paymentIntentId: String,
  paymentStatus: String,
  deliveryLink: String,
  bothAccepted: Boolean
}
```

---

## Test Cards 🧪

```
✅ Success:    4242 4242 4242 4242
❌ Declined:   4000 0000 0000 0002
🔐 3D Secure:  4000 0025 0000 3155

Expiry: Any future date (12/25, 01/26, etc.)
CVC: Any 3 digits (123, 456, etc.)
```

---

## Environment Variables 🔐

### Backend (.env)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Frontend (.env.local)
```
REACT_APP_STRIPE_KEY=pk_test_...
```

Get from: https://dashboard.stripe.com/apikeys

---

## Installation 📦

```bash
# Backend
cd backend
npm install stripe

# Frontend
cd ../frontend
npm install @stripe/react-stripe-js @stripe/js
```

---

## Quick Test 🧪

```bash
# 1. Start backend
cd backend && npm start

# 2. Start frontend
cd ../frontend && npm run dev

# 3. Test workflow
#    - Student posts gig
#    - Freelancer sends counter
#    - Negotiate amount
#    - Both accept
#    - Student makes payment (use test card)
#    - Freelancer delivers
#    - Student accepts delivery
#    - Check payment transferred
```

---

## Troubleshooting 🔧

**No Stripe response?**
- Check API keys in .env files
- Verify Stripe packages installed
- Check browser console for errors

**Payment not working?**
- Ensure REACT_APP_STRIPE_KEY is set
- Try test card: 4242 4242 4242 4242
- Check Stripe dashboard for errors

**Gigs not showing?**
- Verify freelancer domain set in profile
- Check gig domain matches freelancer skills
- Refresh page

**Can't see offers?**
- Student should check "Negotiations" tab
- Freelancer should check offers list
- Verify offer was sent successfully

---

## Documentation Files 📚

```
GIG_NEGOTIATION_SETUP.md       ← Setup guide
GIG_IMPLEMENTATION_SUMMARY.md  ← Technical details
NEGOTIATION_AMOUNTS_GUIDE.md   ← Amount mechanics
STUDENT_GIG_GUIDE.md           ← Student tutorial
FREELANCER_GUIDE.md            ← Freelancer tutorial
PROJECT_COMPLETE_SUMMARY.md    ← Project overview
IMPLEMENTATION_CHECKLIST.md    ← Verification list
IMPLEMENTATION_COMPLETE.md     ← Status summary
```

---

## Code Examples 💻

### Send Counter Offer
```javascript
const response = await axios.post(
  `http://localhost:4001/api/v1/gig-offers/${freelancerId}/create`,
  {
    gigId: gigId,
    offeredAmount: 4950
  }
);
```

### Update Amount
```javascript
const response = await axios.put(
  `http://localhost:4001/api/v1/gig-offers/${offerId}/update-amount`,
  {
    newAmount: 5000,
    updatedBy: "student",
    comment: "Counter offer"
  }
);
```

### Create Payment
```javascript
const response = await axios.post(
  `http://localhost:4001/api/v1/gig-offers/${offerId}/payment`,
  {
    paymentMethodId: paymentMethod.id
  }
);
```

### Submit Delivery
```javascript
const response = await axios.put(
  `http://localhost:4001/api/v1/gig-offers/${offerId}/deliver`,
  {
    deliveryLink: "https://youtube.com/watch?v=..."
  }
);
```

---

## Button Mapping 🔘

| Button | Function | Component |
|--------|----------|-----------|
| [-50 PKR] | Decrement amount | GigNegotiation |
| [+50 PKR] | Increment amount | GigNegotiation |
| [Send Counter] | Submit offer | GigNegotiation |
| [Accept] | Accept offer | StudentGigOffers |
| [Reject] | Reject offer | StudentGigOffers |
| [Hold Payment] | Create payment intent | GigPayment |
| [Submit Delivery] | Send work link | GigDelivery |
| [Accept & Release] | Release payment | GigDelivery |

---

## Status Transitions 🔄

```
pending
├─→ accepted (both accept same amount)
│   ├─→ delivered (freelancer submits)
│   │   └─→ completed (student accepts)
│   │       └─→ paid (payment transferred)
│   └─→ (negotiation continues)
└─→ rejected (offer rejected)
```

---

## Key Numbers 📊

- **9 API endpoints**
- **5 React components** (new)
- **1 Model** (GigOffer)
- **9 Controller functions**
- **50 PKR** increment/decrement
- **$0.18 USD** ≈ 50 PKR
- **1-2 days** for withdrawal
- **100%** escrow protection

---

## Permissions 🔐

| Action | Who | When |
|--------|-----|------|
| Send offer | Freelancer | After seeing gig |
| Update amount | Both | During negotiation |
| Accept offer | Both | After negotiation |
| Make payment | Student | After both accept |
| Submit delivery | Freelancer | After payment held |
| Accept delivery | Student | After delivery submitted |
| Withdraw | Freelancer | After payment released |

---

## Response Examples 📋

### Create Offer Success
```json
{
  "message": "Counter offer sent successfully",
  "offer": {
    "_id": "...",
    "offeredAmount": 4950,
    "status": "pending",
    "bothAccepted": false
  }
}
```

### Both Accepted
```json
{
  "_id": "...",
  "status": "accepted",
  "bothAccepted": true,
  "freelancerAcceptedAt": "2025-12-07T10:15:00Z",
  "studentAcceptedAt": "2025-12-07T10:20:00Z"
}
```

### Payment Created
```json
{
  "paymentIntentId": "pi_...",
  "clientSecret": "pi_..._secret_...",
  "message": "Payment held successfully"
}
```

---

## Color Scheme 🎨

```
Blue: Primary actions, buttons
Purple: Gradients, secondary
Green: Success, accept, approve
Red: Decline, reject, cancel
Yellow: Pending, warning
Gray: Disabled, neutral
```

---

## Dependencies ✅

### Backend
- stripe
- mongoose
- express
- bcryptjs
- jsonwebtoken

### Frontend
- react
- react-router-dom
- axios
- tailwind-css
- @stripe/react-stripe-js
- @stripe/js
- react-icons

---

## Version Info 📌

- **Version**: 1.0.0
- **Created**: December 7, 2025
- **Status**: Production Ready
- **Node**: 22.4.1+
- **React**: 19.1.1+
- **Express**: 5.1.0+
- **Stripe**: Latest

---

## Useful Links 🔗

- Stripe Docs: https://stripe.com/docs
- React Stripe: https://stripe.com/docs/stripe-js/react
- MongoDB: https://docs.mongodb.com
- Express: https://expressjs.com
- Tailwind: https://tailwindcss.com
- React: https://react.dev

---

**Last Updated**: December 7, 2025
**Quick Reference**: v1.0.0
**For more details, see full documentation files**
