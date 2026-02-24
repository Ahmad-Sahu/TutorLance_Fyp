# Step-by-Step Testing Guide - Complete Workflow

## Prerequisites
- Backend running: `npm start` in `/backend`
- Frontend running: `npm run dev` in `/frontend`
- MongoDB connected
- Stripe keys configured

---

## Test Scenario: Complete Gig Workflow

### Phase 1: Student Setup & Gig Posting

**Step 1: Create Student Account**
```
URL: http://localhost:5173/signup
Role: Student
Name: John Doe
Email: student@test.com
Password: password123
```

**Step 2: Login as Student**
```
URL: http://localhost:5173/login
Email: student@test.com
Password: password123
```

**Step 3: Post a New Gig**
- Navigate to "Student Dashboard" → "Post New Gig"
- Fill in:
  - Title: "Flutter App Development"
  - Description: "Need to build a todo app with Firebase backend"
  - Domain: "Flutter"
  - Budget: 5000 PKR
- Click "Post Gig"
- Expected: ✅ Gig appears in "My Gigs"

**Step 4: Note the Gig Details**
- Student ID: Should be in localStorage as "studentId"
- Student Name: Should be "John Doe"
- Gig ID: Note this for later

---

### Phase 2: Freelancer Setup & Discovery

**Step 5: Create Freelancer Account**
```
URL: http://localhost:5173/signup
Role: Freelancer
Name: Jane Smith
Email: freelancer@test.com
Password: password123
```

**Step 6: Update Freelancer Profile**
- Navigate to "Freelancer Dashboard" → "Profile"
- Click "Edit Profile"
- Set Domain/Skills: "Flutter" (MUST match student's domain)
- Save Profile
- Expected: ✅ Profile saved to localStorage

**Step 7: Check Available Gigs**
- Click "Available Gigs" in sidebar
- Expected: ✅ Should see "Flutter App Development" gig posted by "John Doe"
- Verify: Student name "John Doe" is displayed
- Budget: 5000 PKR shown

---

### Phase 3: Freelancer Negotiation

**Step 8: Freelancer Sends Counter Offer**
- On the gig card, see "Send Counter Offer" section
- Default amount: 5000 PKR
- Click [-50 PKR] button → Should become 4950 PKR
- Click [+50 PKR] button → Should become 5000 PKR
- Click [+50 PKR] again → Should become 5050 PKR
- Click "Send Counter Offer"
- Expected: ✅ Alert: "✅ Counter offer sent successfully!"

**Step 9: Verify Offer Created**
- Backend should create GigOffer document with:
  - freelancerId: Jane Smith's ID
  - studentId: John Doe's ID
  - offeredAmount: 5050
  - status: "pending"
  - negotiationHistory: [{ updatedBy: "freelancer", amount: 5050 }]

---

### Phase 4: Student Reviews & Negotiates

**Step 10: Student Logout & Login**
- Logout as Freelancer
- Login as Student (student@test.com)
- Click "My Gigs" → Click on the Flutter App Development gig

**Step 11: View Counter Offers**
- Click "Negotiations" tab
- Expected: ✅ Shows counter offer from "Jane Smith"
- Amount: 5050 PKR
- Status: "pending"

**Step 12: Student Counter-Negotiates**
- In the amount field, enter: 4800
- Click "Counter" button
- Expected: ✅ Alert: "✅ Counter amount sent!"
- Negotiation History now shows:
  - Jane Smith: 5050 PKR
  - John Doe: 4800 PKR

**Step 13: Student Accepts Offer**
- See the counter offer again with 4800 PKR
- Click "Accept" button
- Expected: ✅ Alert: "✅ Offer accepted!"
- Status changes to: "accepted"

---

### Phase 5: Freelancer Confirms

**Step 14: Freelancer Sees Acceptance**
- Logout and login as Freelancer
- Check freelancer offers/pending work
- Should see the offer from John Doe was accepted at 4800 PKR

**Step 15: Freelancer Also Accepts**
- Click "Accept" button (if available in offers view)
- Expected: ✅ Status becomes "accepted" for both
- Message: "Both parties have accepted. Ready for payment!"

---

### Phase 6: Payment Processing

**Step 16: Student Makes Payment**
- Login as Student again
- Navigate to "Delivery & Payment" tab
- Should see "Make Payment" section
- Card Details:
  - Card Number: 4242 4242 4242 4242
  - Expiry: 12/25 (any future date)
  - CVC: 123 (any 3 digits)
- Click "Pay PKR 4800" button
- Expected: ✅ "Payment held on card"
- Status: "payment_held"
- Message: "Escrow: Amount held until work is delivered"

**Step 17: Verify Payment Intent Created**
- Check Stripe Dashboard test transactions
- Should see: "4,800 PKR payment intent in HELD state"
- Status: Not charged yet

---

### Phase 7: Delivery & Completion

**Step 18: Freelancer Submits Work**
- Login as Freelancer
- Navigate to their work area or notifications
- Click "Submit Delivery"
- Delivery Link: Paste a YouTube URL (example: https://youtube.com/watch?v=sample)
- Click "Submit Delivery"
- Expected: ✅ Alert: "✅ Delivery submitted!"
- Status: "delivered"

**Step 19: Student Reviews & Accepts**
- Login as Student
- Go to "Delivery & Payment" tab
- See freelancer's delivery link with preview
- Click "Accept & Release Payment"
- Expected: ✅ Alert: "✅ Delivery accepted!"
- Status: "completed" → "paid"

**Step 20: Verify Payment Charged**
- Check Stripe Dashboard
- Payment should now show: "CHARGED"
- Amount transferred: 4,800 PKR

---

## Success Criteria Checklist

### Security ✅
- [ ] Student A cannot see Student B's counter offers
- [ ] Freelancer A can only see offers for gigs matching their domain
- [ ] Only the posting student can accept/reject offers for that gig

### Functionality ✅
- [ ] Freelancer can see student name on gig posts
- [ ] Freelancer can send counter offers with +50/-50 buttons
- [ ] Student can negotiate counter amounts
- [ ] Both parties can accept offers
- [ ] Payment is held in escrow (not charged) until work delivered
- [ ] Work submission and acceptance works
- [ ] Payment releases to freelancer after acceptance

### User Experience ✅
- [ ] All alerts and messages are clear
- [ ] Status changes are visible
- [ ] No confusing "Unknown Student" messages
- [ ] Negotiation history is tracked and displayed
- [ ] Color-coded status badges (pending=yellow, accepted=green, etc)

---

## Troubleshooting

### Problem: "You can only view offers for your own gigs" error
**Solution**: Ensure you're logged in as the student who posted the gig. Refresh page and check localStorage has correct studentId.

### Problem: Gig shows "Unknown Student" name
**Solution**: 
1. Verify `studentName` is saved when posting gig
2. Check backend: `POST /api/v1/student-gigs` sets `studentName`
3. Clear localStorage and re-login

### Problem: Freelancer doesn't see gigs in "Available Gigs"
**Solution**:
1. Verify freelancer's domain matches gig's domain (case-sensitive!)
2. Check backend endpoint: `GET /api/v1/student-gigs/relevant/:freelancerId`
3. Ensure gigs have domain field set

### Problem: "Send Counter Offer" button not appearing
**Solution**:
1. Verify you're logged in as freelancer
2. Check GigNegotiation component is imported in FreeLancerDashboard
3. Clear browser cache: Ctrl+Shift+Delete

### Problem: Payment button grayed out
**Solution**:
1. Ensure both freelancer AND student have accepted the offer
2. Check `bothAccepted = true` in database
3. Verify Stripe keys are configured in .env files

---

## Database Verification Commands

### Check if offer was created:
```bash
# In MongoDB
db.gigoffer.findOne({ freelancerId: "..." })
```

### Check negotiation history:
```bash
db.gigoffer.findOne({ _id: "..." }).negotiationHistory
```

### Check payment intent:
```bash
db.gigoffer.findOne({ paymentIntentId: { $exists: true } })
```

---

## API Endpoints Being Used

| Action | Endpoint | Method |
|--------|----------|--------|
| Post gig | /api/v1/student-gigs | POST |
| Get relevant gigs | /api/v1/student-gigs/relevant/:freelancerId | GET |
| Send counter | /api/v1/gig-offers/:freelancerId/create | POST |
| Get offers | /api/v1/gig-offers/gig/:gigId?studentId=... | GET |
| Accept offer | /api/v1/gig-offers/:offerId/accept | PUT |
| Create payment | /api/v1/gig-offers/:offerId/payment | POST |
| Submit delivery | /api/v1/gig-offers/:offerId/deliver | PUT |
| Accept delivery | /api/v1/gig-offers/:offerId/accept-delivery | PUT |

---

## Expected Timeline
- Phase 1-2: 5 minutes
- Phase 3-4: 5 minutes  
- Phase 5-6: 3 minutes
- Phase 7: 2 minutes
- **Total**: ~15 minutes for full workflow test

---

**Status**: Ready for comprehensive testing! 🚀
