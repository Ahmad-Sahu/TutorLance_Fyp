# Freelancer Gig Negotiation & Delivery Guide

Complete guide for freelancers on how to find gigs, send counter offers, negotiate, deliver work, and withdraw earnings.

## Freelancer Dashboard Overview

```
┌──────────────────────────────────────┐
│      FREELANCER DASHBOARD            │
├──────────────────────────────────────┤
│                                      │
│ [Dashboard] [Profile] [Available]    │
│ [My Gigs] [Feedback] [Settings]      │
│                                      │
└──────────────────────────────────────┘
```

## Phase 1: Find Available Gigs

### Step 1.1: Navigate to Available Gigs
1. Log in to Freelancer Dashboard
2. Click "Available Gigs" in sidebar
3. See all gigs matching your domain/skills

```
┌────────────────────────────────────────┐
│   🎯 AVAILABLE GIGS                    │
├────────────────────────────────────────┤
│                                        │
│ Matching Your Skills: Flutter, Mobile │
│                                        │
│ [  Need Flutter App Tutorial Video  ]  │
│ Description: Create 30-min video       │
│ Domain: Flutter Development            │
│ Budget: PKR 5000                       │
│ Posted: 2 hours ago                    │
│                                        │
│ [  Another Gig Title  ]                │
│ ...                                    │
│                                        │
└────────────────────────────────────────┘
```

### Step 1.2: Gig Filters
Gigs shown are filtered by:
- **Domain**: Your freelancer profile domain
- **Skills**: Match your listed skills
- **Status**: Only active (non-completed) gigs

### Step 1.3: Review Gig Details
Each gig shows:
- **Title**: What the student needs
- **Description**: Detailed requirements
- **Domain**: The work category
- **Budget**: Original student budget
- **Posted Date**: When gig was posted

---

## Phase 2: Send Counter Offer

### Step 2.1: Use GigNegotiation Component
For each gig, you see the negotiation interface:

```
┌────────────────────────────────────────┐
│   💰 SEND COUNTER OFFER                │
├────────────────────────────────────────┤
│                                        │
│ Counter Offer Amount                   │
│ PKR 5000                               │
│                                        │
│ Original Budget: PKR 5000              │
│                                        │
│ [    -50 PKR    ] [    +50 PKR    ]   │
│                                        │
│ [ Send Counter Offer ]                 │
│                                        │
└────────────────────────────────────────┘
```

### Step 2.2: Adjust Your Price
The student's original budget is the starting point.

**Option 1: Charge Less**
- Click "-50 PKR" multiple times
- Lower your fee to be competitive
- Example: 5000 → 4950 → 4900

**Option 2: Charge Same**
- Keep original amount
- Fair price that matches budget
- Quick acceptance likely

**Option 3: Charge More**
- Click "+50 PKR" multiple times
- If work is harder than budget suggests
- Example: 5000 → 5050 → 5100

### Step 2.3: Send the Offer
1. Adjust amount to your price
2. Click "Send Counter Offer"
3. Offer is sent to the student

```
Counter Offer Amount: PKR 4950

[  -50 PKR  ]  [  +50 PKR  ]
   ↓
   Freelancer clicks "-50" button once
   Amount becomes: PKR 4950

[ Send Counter Offer ]
   ↓
   ✓ Offer sent to student!
```

### Step 2.4: Offer Sent Confirmation
After sending:

```
┌────────────────────────────────────────┐
│   ✓ COUNTER OFFER SENT!                │
├────────────────────────────────────────┤
│                                        │
│ Gig: Need Flutter App Tutorial Video   │
│ Your Counter: PKR 4950                 │
│ Status: PENDING                        │
│                                        │
│ Student will review your offer         │
│ and may accept or counter.             │
│                                        │
│ You can send only one offer per gig.   │
│ Wait for student's response.           │
│                                        │
└────────────────────────────────────────┘
```

---

## Phase 3: Negotiate Amount

### Step 3.1: Student Counters Your Offer
Student may:
- **Accept** your offer → Done negotiating ✓
- **Counter** with different amount → Continue negotiating
- **Reject** your offer → Gig ends

### Step 3.2: Track Negotiations

View your active negotiations:

```
┌────────────────────────────────────────┐
│   📊 ACTIVE NEGOTIATIONS               │
├────────────────────────────────────────┤
│                                        │
│ Gig: Flutter App Tutorial Video        │
│ Current Amount: PKR 5050               │
│ Status: PENDING                        │
│                                        │
│ 🔄 Negotiation History                 │
│ ├─ You: PKR 4950 - Initial counter    │
│ └─ Student: PKR 5050 - Counter offer   │
│                                        │
│ Decision: Accept or Counter            │
│ [  Accept  ] [Counter +50] [Counter -50]│
│                                        │
└────────────────────────────────────────┘
```

### Step 3.3: Respond to Counter

When student counters, you can:

**Option 1: Accept**
- Click "Accept"
- Both agreed on the amount
- Ready to move to payment

**Option 2: Counter Again**
- Click "Counter +50" or "Counter -50"
- Send your counter back to student
- Negotiation continues

```
Student's Counter: PKR 5050

You think:
├─ "That's OK" → [Accept]
├─ "Want more" → [Counter +50]
└─ "Need less" → [Counter -50]
```

### Step 3.4: Examples of Negotiation

**Quick Agreement:**
```
You offer: 5000 PKR
Student: Accepts immediately ✓
Final: 5000 PKR
```

**Down Negotiation:**
```
You offer: 4850 PKR
Student: Accepts ✓
Final: 4850 PKR
```

**Extended Back-and-Forth:**
```
You offer: 4900 PKR
Student counters: 5150 PKR
You counter: 5100 PKR
Student: Accepts ✓
Final: 5100 PKR
```

---

## Phase 4: Both Accept Agreement

### Step 4.1: Offer Accepted
Once both agree on same amount:

```
┌────────────────────────────────────────┐
│   ✓ OFFER ACCEPTED!                    │
├────────────────────────────────────────┤
│                                        │
│ Gig: Flutter App Tutorial Video        │
│ Agreed Amount: PKR 5100                │
│ Status: ACCEPTED ✓                     │
│                                        │
│ Next Steps:                            │
│ 1. Student will make payment           │
│ 2. Payment is held on their card       │
│ 3. Submit your delivery                │
│ 4. Student reviews and accepts         │
│ 5. You receive payment!                │
│                                        │
│ [ View Gig Details ]                   │
│                                        │
└────────────────────────────────────────┘
```

### Step 4.2: Wait for Payment
- Student has agreed to your price
- Student will make payment (held on their card)
- You will be notified when payment is received

---

## Phase 5: Prepare Delivery

### Step 5.1: Check Requirements
Review gig description carefully:
- What exactly does the student want?
- What format should you deliver?
- Any specific requirements?
- Deadline (if mentioned)?

### Step 5.2: Create Work
Example (Flutter Video Tutorial):
- Record 30-minute tutorial
- Cover Flutter basics
- Upload to YouTube
- Get public link

### Step 5.3: Prepare Delivery Link
Make sure you have:
- **YouTube Link**: https://youtube.com/watch?v=...
- **Google Drive Link**: https://drive.google.com/file/d/...
- **GitHub Repo**: https://github.com/username/repo
- **Other Public URL**: Any accessible link

**Important**: Make sure the link is:
- ✓ Public (anyone can access)
- ✓ Doesn't expire soon
- ✓ Direct to the work
- ✓ Free to access

---

## Phase 6: Submit Delivery

### Step 6.1: Access Delivery Form

In your gig details, you'll see:

```
┌────────────────────────────────────────┐
│   📤 SUBMIT YOUR DELIVERY              │
├────────────────────────────────────────┤
│                                        │
│ Gig: Flutter App Tutorial Video        │
│ Agreed Amount: PKR 5100                │
│ Status: Ready for Delivery             │
│                                        │
│ YouTube Link or File URL               │
│ [https://youtube.com/watch?v=...]     │
│                                        │
│ Tips:                                  │
│ ✓ Upload to YouTube or Google Drive    │
│ ✓ Share public link here               │
│ ✓ Student will review and accept       │
│ ✓ Payment released after acceptance    │
│                                        │
│ [ Submit Delivery ]                    │
│                                        │
└────────────────────────────────────────┘
```

### Step 6.2: Enter Your Link
1. Copy the public link to your work
2. Paste in "YouTube Link or File URL" field
3. Click "Submit Delivery"

### Step 6.3: Delivery Submitted Confirmation

After submission:

```
┌────────────────────────────────────────┐
│   ✓ DELIVERY SUBMITTED!                │
├────────────────────────────────────────┤
│                                        │
│ Delivery Link:                         │
│ https://youtube.com/watch?v=xyz        │
│                                        │
│ Status: DELIVERED                      │
│ Submitted At: 2025-12-07 10:30 AM      │
│                                        │
│ What Happens Next:                     │
│ 1. Student reviews your delivery       │
│ 2. Student can access your link        │
│ 3. If satisfied, student accepts       │
│ 4. Payment is charged to their card    │
│ 5. You receive payment!                │
│                                        │
│ Waiting for student review...          │
│                                        │
└────────────────────────────────────────┘
```

---

## Phase 7: Student Reviews & Accepts

### Step 7.1: Student Reviews Your Work
1. Student receives delivery link
2. Student clicks your link
3. Student reviews your work
4. Student decides if it's good quality

### Step 7.2: Student Accepts Delivery
If satisfied, student clicks "Accept & Release Payment"

```
Student Action:
├─ ✓ Happy with work → "Accept & Release"
│                    → Payment charged
│                    → You get paid ✓
│
└─ ✗ Not satisfied → Requests revision
                   → Or rejects offer
                   → No payment
```

---

## Phase 8: Payment Received

### Step 8.1: Payment Confirmation

Once student accepts:

```
┌────────────────────────────────────────┐
│   ✓ PAYMENT RECEIVED!                  │
├────────────────────────────────────────┤
│                                        │
│ Gig: Flutter App Tutorial Video        │
│ Status: COMPLETED ✓                    │
│                                        │
│ Amount Paid: PKR 5100                  │
│ Your Earning: PKR 5100                 │
│                                        │
│ Payment Status: RELEASED               │
│ Date Received: 2025-12-07 10:45 AM     │
│                                        │
│ Next: Withdraw to Your Bank            │
│                                        │
│ [ Request Withdrawal ]                 │
│                                        │
└────────────────────────────────────────┘
```

### Step 8.2: Payment Appears in Wallet
- Payment added to your TutorLance wallet
- Available balance increases
- Can withdraw anytime to bank account

---

## Phase 9: Withdraw Earnings

### Step 9.1: Check Wallet Balance
In dashboard, see:
- **Available Balance**: PKR 5100
- **Pending**: PKR 0
- **Withdrawn**: PKR 10,500

### Step 9.2: Request Withdrawal
1. Click "Request Withdrawal" button
2. Enter bank details (one time only)
   - Bank Name
   - Account Number
   - IBAN or Swift Code
3. Enter amount to withdraw
4. Click "Submit Withdrawal"

### Step 9.3: Withdrawal Processing

```
Timeline:
├─ Submit withdrawal → PENDING
│
├─ Platform verifies → (1-2 hours)
│
├─ Bank transfer initiated → PROCESSING
│
└─ Arrives in your account → COMPLETED
   └─ (1-2 business days)
```

### Step 9.4: Money in Your Bank
- Funds transferred via Stripe
- Secure bank-to-bank transfer
- No additional fees
- Regular basis (weekly/monthly)

---

## Complete Freelancer Workflow

```
1️⃣  VIEW AVAILABLE GIGS
    ↓
    See gigs matching your domain
    ↓

2️⃣  SEND COUNTER OFFER
    ↓
    Use +50/-50 buttons to set your price
    Click "Send Counter Offer"
    ↓

3️⃣  NEGOTIATE AMOUNT
    ↓
    Student may counter your price
    You can accept or counter back
    ↓

4️⃣  BOTH ACCEPT
    ↓
    Offer status = ACCEPTED
    ↓

5️⃣  STUDENT PAYS
    ↓
    Student enters card details
    Payment held (not charged yet)
    ↓

6️⃣  CREATE YOUR WORK
    ↓
    Make the gig deliverable
    Record video, write code, etc.
    ↓

7️⃣  SUBMIT DELIVERY
    ↓
    Paste public link to your work
    Click "Submit Delivery"
    ↓

8️⃣  STUDENT REVIEWS
    ↓
    Student clicks your link
    Student reviews your work quality
    ↓

9️⃣  STUDENT ACCEPTS
    ↓
    Student clicks "Accept & Release"
    Payment charged to their card
    ↓

🔟  YOU GET PAID
    ↓
    Payment appears in wallet
    Available for withdrawal
    ↓

1️⃣1️⃣  WITHDRAW TO BANK
    ↓
    Request withdrawal
    Money transfers to bank (1-2 days)
    ↓

✅  COMPLETE & EARN!
```

---

## Freelancer Tips & Best Practices

### ✓ Pricing Strategy
- **Undercut slightly**: Be 50-100 PKR below budget to stand out
- **Fair pricing**: Don't drastically undercut (damages your reputation)
- **Value-based**: Charge based on complexity, not just budget
- **Negotiate reasonably**: Make 2-3 counters, then accept

### ✓ Delivery Excellence
- **Exceed expectations**: Give more than promised
- **High quality**: Your delivery impacts your rating
- **On time**: Submit as soon as ready
- **Clear communication**: Include notes/instructions if needed

### ✓ Building Reputation
- **Get good ratings**: More stars = more offers
- **Repeat clients**: Build long-term relationships
- **Professional**: Always communicate clearly
- **Problem solving**: Fix issues if student isn't satisfied

### ✓ Avoid Common Mistakes
- ✗ Don't ignore student messages
- ✗ Don't submit poor quality work
- ✗ Don't charge much higher than budget
- ✗ Don't delete account with active gigs

### ✓ Maximize Earnings
- **Multiple gigs**: Accept many offers simultaneously
- **Faster delivery**: Complete gigs quickly, do more
- **Premium pricing**: Build skills to command higher rates
- **Regular withdrawal**: Keep cash flow healthy

---

## Troubleshooting

### Q: No gigs are showing in Available Gigs?
**A:** Check:
- Is your profile domain/skills set?
- Are you logged in?
- Are there gigs posted in your domain?
- Try refreshing the page

### Q: Student isn't responding to my counter?
**A:** Don't worry:
- Students might be busy
- They have time to decide
- Your offer stays active for days
- Can accept other gigs meanwhile

### Q: Student rejected my offer?
**A:** That's OK:
- Look for other gigs
- Can offer on same gig again later
- Different student might accept
- Rejection is not personal

### Q: Payment not showing in wallet?
**A:** Check:
- Did student accept your delivery?
- Sometimes takes a few minutes to update
- Refresh page
- Contact support if delayed

### Q: Bank transfer taking too long?
**A:** Typical timeline:
- 1-2 business days (normal)
- Weekend/holiday delays are normal
- Contact support if over 3 days
- Check with your bank

---

## Support & Contact

- **Payment Issues**: Email support@tutorlance.com
- **Gig Problems**: Use dispute system in app
- **Withdrawal Help**: Check banking details
- **Stripe Support**: For payment issues

---

**Version**: 1.0.0
**Created**: December 7, 2025
**Status**: Ready for Freelancers
