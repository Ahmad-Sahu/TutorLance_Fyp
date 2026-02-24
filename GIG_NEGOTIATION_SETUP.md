# TutorLance Gig Negotiation & Payment System

Complete guide for implementing the gig negotiation and payment system with Stripe integration.

## System Overview

The gig negotiation and payment system allows:
1. **Freelancers** to send counter offers with custom amounts
2. **Negotiation** with +50/-50 PKR increment buttons
3. **Both parties** to accept the agreed amount
4. **Payment Hold** - Student's card is charged but payment held in escrow
5. **Delivery** - Freelancer submits work (YouTube link, file URL)
6. **Payment Release** - Student confirms delivery, payment released to freelancer
7. **Withdrawal** - Freelancer can withdraw earnings

## Installation & Setup

### 1. Backend Setup

#### Install Stripe Package
```bash
cd backend
npm install stripe
```

#### Configure Environment Variables
Add to `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

Get these from: https://dashboard.stripe.com/apikeys

#### Models Added
- **GigOffer.model.js**: Stores counter offers, negotiations, payment info, delivery details

#### Controllers Added
- **GigOffer.controller.js**: Handles all gig offer operations

#### Routes Added
- **GigOffer.route.js**: All gig negotiation endpoints

#### Backend Endpoints
```
POST   /api/v1/gig-offers/:freelancerId/create       - Create counter offer
GET    /api/v1/gig-offers/gig/:gigId                 - Get offers for a gig
GET    /api/v1/gig-offers/freelancer/:freelancerId   - Get freelancer's offers
PUT    /api/v1/gig-offers/:offerId/update-amount     - Update counter amount
PUT    /api/v1/gig-offers/:offerId/accept            - Accept offer
PUT    /api/v1/gig-offers/:offerId/reject            - Reject offer
POST   /api/v1/gig-offers/:offerId/payment           - Create payment intent
PUT    /api/v1/gig-offers/:offerId/deliver           - Submit delivery
PUT    /api/v1/gig-offers/:offerId/accept-delivery   - Accept delivery & release payment
```

### 2. Frontend Setup

#### Install Stripe Packages
```bash
cd frontend
npm install @stripe/react-stripe-js @stripe/js
```

#### Configure Environment Variables
Add to `frontend/.env.local`:
```env
REACT_APP_STRIPE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

#### Components Created
1. **GigNegotiation.jsx** - Counter offer form with +50/-50 buttons
2. **GigPayment.jsx** - Stripe payment form with card input
3. **GigDelivery.jsx** - Delivery submission and review
4. **StudentGigOffers.jsx** - Display offers received by student
5. **StudentGigsPage.jsx** - Complete student gigs management

#### Updated Components
- **FreeLancerDashboard.jsx** - Added "Available Gigs" section showing gigs matching freelancer's domain

## Workflow

### Step 1: Student Posts Gig
1. Student logs in to dashboard
2. Creates new gig with title, description, domain, budget
3. Gig is stored in database

### Step 2: Freelancer Sees Available Gig
1. Freelancer logs in to dashboard
2. Clicks "Available Gigs" in sidebar
3. Sees gigs matching their domain/skills
4. Uses GigNegotiation component to send counter offer

### Step 3: Negotiation
1. Freelancer clicks "+50 PKR" or "-50 PKR" buttons to adjust offer amount
2. Clicks "Send Counter Offer"
3. Student sees offer in "Negotiations" tab
4. Student can:
   - Accept the offer
   - Counter with a different amount
   - Reject the offer

### Step 4: Both Accept
Once both parties accept the same amount, it's "accepted" status.

### Step 5: Payment Hold
1. Student opens "Delivery & Payment" tab
2. Enters card details using Stripe payment form
3. Amount is held on card (not charged immediately)
4. Test card: `4242 4242 4242 4242` (Exp: any future date, CVC: any 3 digits)

### Step 6: Freelancer Delivers
1. Freelancer clicks "Submit Your Delivery"
2. Enters YouTube link or file URL (e.g., Google Drive link)
3. Student receives notification
4. Freelancer marks as delivered

### Step 7: Student Reviews & Releases Payment
1. Student clicks "Review Delivery"
2. Clicks link to view freelancer's work
3. If satisfied, clicks "Accept & Release Payment"
4. Stripe charges the card
5. Payment is marked as released to freelancer

### Step 8: Freelancer Withdrawal
- Freelancer can withdraw funds to their bank account
- Stripe connects to their bank via Stripe Connect
- Funds are transferred within 1-2 business days

## Testing with Stripe Test Cards

Use these test cards in development:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

**Card Declined:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**3D Secure Authentication:**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

## Database Schema

### GigOffer Document
```javascript
{
  gigId: ObjectId,           // Reference to Student_Gig
  freelancerId: ObjectId,    // Freelancer sending offer
  studentId: ObjectId,       // Student receiving offer
  originalBudget: Number,    // Original gig budget
  offeredAmount: Number,     // Counter offer amount
  status: String,            // pending|accepted|rejected|delivered|completed|paid
  negotiationHistory: [{
    updatedBy: String,       // "freelancer" or "student"
    amount: Number,
    timestamp: Date,
    comment: String
  }],
  paymentIntentId: String,   // Stripe payment intent ID
  paymentStatus: String,     // pending|held|released|paid
  deliveryLink: String,      // YouTube or file URL
  deliveredAt: Date,
  freelancerAcceptedAt: Date,
  studentAcceptedAt: Date,
  bothAccepted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

### 1. Negotiation +/- Buttons
- Increment/decrement by 50 PKR (customizable)
- Allows freelancer and student to negotiate price
- Shows negotiation history

### 2. Escrow Payment Hold
- Payment is authorized on card but not charged immediately
- Prevents payment if freelancer doesn't deliver
- Student has full control

### 3. Delivery Verification
- Freelancer submits work proof (link)
- Student can view before accepting
- Payment only released after student confirms

### 4. Wallet & Withdrawal
- Freelancer can view earnings balance
- Request withdrawal to bank account
- Stripe handles bank transfers securely

## Integration with Existing System

The system integrates with:
- **Student Model**: Enhanced with gig posting capability
- **Freelancer Model**: Enhanced with earnings tracking
- **Student_Gig Model**: Posts gigs for freelancers to bid on
- **StudentDashboard**: Shows student's gigs and negotiations
- **FreeLancerDashboard**: Shows available gigs and negotiations

## Future Enhancements

1. **Automatic Escrow Release**: Auto-release after N days if no dispute
2. **Dispute Resolution**: Platform mediates payment disputes
3. **Reviews & Ratings**: Rate freelancers after gig completion
4. **Automated Payouts**: Monthly automatic payouts to freelancers
5. **Multiple Payment Methods**: Add PayPal, Bank Transfer, etc.
6. **Refunds & Chargebacks**: Handle refund requests from students

## Security & Best Practices

1. **PCI Compliance**: Never handle card data directly - use Stripe
2. **HTTPS Only**: All payments over HTTPS
3. **Webhook Verification**: Verify Stripe webhooks are from Stripe
4. **Rate Limiting**: Limit API requests to prevent abuse
5. **Input Validation**: Validate all user inputs
6. **Error Handling**: Don't expose sensitive information in errors

## Troubleshooting

### Stripe API Errors

**"Invalid API Key"**
- Check STRIPE_SECRET_KEY in backend .env
- Ensure key is valid from stripe.com/apikeys

**"Payment Intent Confirmation Failed"**
- Verify student has been charged on card
- Check Stripe dashboard for payment details

**"Webhook Signature Verification Failed"**
- Verify webhook signing secret is correct
- Ensure request is from Stripe

### Common Issues

**Payment not being held**
- Verify payment method exists
- Check card hasn't expired
- Ensure amount is in cents (multiply by 100)

**Delivery link not showing**
- Verify URL is public/accessible
- Check URL format
- Ensure link isn't expired

**Freelancer not seeing available gigs**
- Verify freelancer domain/skills set in profile
- Check gig domain matches freelancer skills
- Ensure gig is created successfully

## Support & Documentation

- **Stripe Docs**: https://stripe.com/docs
- **React Stripe Docs**: https://stripe.com/docs/stripe-js/react
- **Stripe Testing**: https://stripe.com/docs/testing

## Version History

- **v1.0.0** (Current)
  - Basic gig negotiation
  - Stripe payment integration
  - Delivery tracking
  - Freelancer earnings

---

**Last Updated**: December 7, 2025
**Status**: Production Ready (with test keys)
