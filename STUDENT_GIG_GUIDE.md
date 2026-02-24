# Student Gig Management & Negotiation Flow

Complete guide for students on how to post gigs, receive offers, negotiate, and make payments.

## Student Dashboard Overview

```
┌──────────────────────────────────────┐
│        STUDENT DASHBOARD             │
├──────────────────────────────────────┤
│                                      │
│  [My Gigs] [Negotiations] [Delivery] │
│                                      │
└──────────────────────────────────────┘
```

## Phase 1: Create & Post Gig

### Step 1.1: Post New Gig
1. Click "Create New Gig" on Student Dashboard
2. Fill in gig details:
   - **Title**: "Need Flutter App Tutorial Video"
   - **Description**: "Create a 30-minute Flutter basics video"
   - **Domain**: "Flutter Development"
   - **Budget**: 5000 PKR

3. Click "Post Gig"
4. Gig is now visible to freelancers with matching skills

### Step 1.2: Gig Appears to Freelancers
- Gig is listed in "Available Gigs" on FreeLancer Dashboard
- Matches freelancers with "Flutter" domain/skills
- Freelancers can now send counter offers

---

## Phase 2: Receive & Review Counter Offers

### Step 2.1: View Incoming Offers
1. Student clicks "Negotiations" tab
2. Selects the gig they posted
3. See all freelancers who sent counter offers

```
┌────────────────────────────────────────┐
│   Counter Offers Received              │
├────────────────────────────────────────┤
│                                        │
│ Ahmed (Freelancer)                     │
│ Offered: PKR 4950                      │
│ Status: PENDING                        │
│                                        │
│ Negotiation History:                   │
│ └─ Freelancer: PKR 4950                │
│                                        │
│ [  Accept  ] [ Reject ]                │
│                                        │
└────────────────────────────────────────┘
```

### Step 2.2: Offer Details
Each offer shows:
- **Freelancer Name**: Who sent it
- **Offered Amount**: Their counter price
- **Status**: Pending, Accepted, Rejected, etc.
- **Negotiation History**: All previous counter offers

---

## Phase 3: Negotiate Amount

### Step 3.1: Counter the Freelancer
If you don't like the offered amount, counter with your own:

1. In the offer card, see "Negotiate Amount" section
2. Enter your counter price (e.g., 5100)
3. Click "Counter" button
4. Your counter is sent to freelancer

```
Current Freelancer Offer: PKR 4950

Your Counter:
[Enter amount: 5100] [Counter]

Negotiation History:
├─ Freelancer: PKR 4950 - Initial counter offer
└─ Student: PKR 5100 - Counter offer
```

### Step 3.2: Freelancer Responds
1. Freelancer sees your counter (5100 PKR)
2. Freelancer can:
   - **Accept** your counter → Both agreed ✓
   - **Send new counter** → Negotiation continues
   - **Reject** → Offer ends

### Step 3.3: Find Middle Ground
Continue negotiating until both agree:

```
Timeline Example:
├─ Freelancer offers: 4950 PKR
├─ You counter: 5100 PKR
├─ Freelancer counters: 5050 PKR
├─ You accept: 5050 PKR ✓
└─ Both Agreed on: PKR 5050
```

---

## Phase 4: Both Accept Agreement

### Step 4.1: Offer Accepted Status
Once both parties accept the same amount:

```
┌────────────────────────────────────────┐
│   OFFER ACCEPTED                       │
├────────────────────────────────────────┤
│                                        │
│ Ahmed (Freelancer)                     │
│ Agreed Amount: PKR 5050                │
│ Status: ACCEPTED ✓                     │
│                                        │
│ ✓ Both parties have accepted.          │
│   Ready for payment!                   │
│                                        │
│ Next: Make Payment                     │
│                                        │
└────────────────────────────────────────┘
```

### Step 4.2: Payment Tab
- Offer status changes to "ACCEPTED"
- "Delivery & Payment" tab becomes active
- Ready to make payment

---

## Phase 5: Payment Preparation

### Step 5.1: Review Payment Details
Click "Delivery & Payment" tab to see:

```
┌────────────────────────────────────────┐
│   PAYMENT DETAILS                      │
├────────────────────────────────────────┤
│                                        │
│ Agreed Amount: PKR 5050                │
│                                        │
│ Payment Type: SECURE HOLD              │
│ ✓ Amount held on card                  │
│ ✓ Not charged immediately              │
│ ✓ Released after delivery confirmed    │
│                                        │
│ Test Card: 4242 4242 4242 4242        │
│ Expiry: Any future date                │
│ CVC: Any 3 digits (e.g., 123)         │
│                                        │
└────────────────────────────────────────┘
```

### Step 5.2: Why Payment is "Held"?

**Escrow Protection (Safe for You):**
1. Your card is authorized
2. Amount is held but NOT charged
3. You have 100% control
4. Payment only releases if:
   - Freelancer submits delivery
   - You confirm you received it
   - You click "Accept Delivery"

**If Freelancer Doesn't Deliver:**
- Hold is released
- No charge on your card
- You can dispute with freelancer

---

## Phase 6: Make Payment

### Step 6.1: Enter Card Details

Using Stripe secure form:

```
┌────────────────────────────────────────┐
│   SECURE PAYMENT                       │
├────────────────────────────────────────┤
│                                        │
│ Agreed Amount: PKR 5050                │
│                                        │
│ Card Information:                      │
│ [Card Number Field]                    │
│ [MM/YY] [CVC]                          │
│                                        │
│ [ Hold Payment - PKR 5050 ]            │
│                                        │
│ 💡 Your card will be authorized        │
│    but NOT charged immediately         │
│                                        │
└────────────────────────────────────────┘
```

### Step 6.2: Test Card for Development
```
Card Number: 4242 4242 4242 4242
Expiry Date: 12/25 (any future date)
CVC: 123 (any 3 digits)
```

### Step 6.3: Payment Held Confirmation

After successful payment:

```
┌────────────────────────────────────────┐
│   ✓ PAYMENT HELD SUCCESSFULLY!         │
├────────────────────────────────────────┤
│                                        │
│ Amount Held: PKR 5050                  │
│                                        │
│ Status: HELD (not charged yet)         │
│                                        │
│ What happens next:                     │
│ 1. Freelancer submits delivery         │
│ 2. You review freelancer's work        │
│ 3. If satisfied, click "Accept"        │
│ 4. Payment is charged & transferred    │
│                                        │
│ Payment will be released once          │
│ freelancer delivers and you accept.    │
│                                        │
└────────────────────────────────────────┘
```

---

## Phase 7: Freelancer Delivers Work

### Step 7.1: Freelancer Submits Delivery
Freelancer submits their work:
- YouTube video link
- Google Drive document link
- Any public URL

### Step 7.2: You See Delivery Notification
In "Delivery & Payment" tab:

```
┌────────────────────────────────────────┐
│   🎬 REVIEW DELIVERY                   │
├────────────────────────────────────────┤
│                                        │
│ Freelancer Submitted:                  │
│ https://youtube.com/watch?v=xyz        │
│                                        │
│ [View Delivery]                        │
│                                        │
│ ✓ Review the delivery link above       │
│ ✓ If satisfied, accept to release      │
│   payment to freelancer                │
│                                        │
│ [ Accept & Release Payment ]           │
│                                        │
└────────────────────────────────────────┘
```

### Step 7.3: Click Delivery Link
1. Click "View Delivery" or the URL
2. Opens in new tab
3. Review freelancer's work (video, document, etc.)

### Step 7.4: Decision

**If Satisfied:**
- Click "Accept & Release Payment"
- Payment is charged to your card
- Amount transferred to freelancer immediately

**If NOT Satisfied:**
- Don't accept
- Hold remains on your card
- Work with freelancer to fix
- Can request new delivery or reject offer

---

## Phase 8: Payment Released

### Step 8.1: Acceptance Confirmation
After you click "Accept & Release Payment":

```
┌────────────────────────────────────────┐
│   ✓ GIG COMPLETED                      │
├────────────────────────────────────────┤
│                                        │
│ Delivery Link:                         │
│ https://youtube.com/watch?v=xyz        │
│                                        │
│ Amount Released: PKR 5050              │
│                                        │
│ Your Card Charge: PKR 5050             │
│ Freelancer Received: PKR 5050          │
│                                        │
│ Gig Status: COMPLETED ✓                │
│                                        │
│ Can you rate this freelancer?          │
│ [⭐⭐⭐⭐⭐] [ Submit Review ]          │
│                                        │
└────────────────────────────────────────┘
```

### Step 8.2: Payment Status
- **Your Card**: Charged PKR 5050
- **Freelancer Account**: Receives PKR 5050
- **Gig**: Marked as completed
- **Visible**: Both parties can see completed gig

---

## Complete Student Workflow Summary

```
1️⃣  POST GIG
    ↓
    Student creates gig with budget and details
    ↓

2️⃣  RECEIVE OFFERS
    ↓
    Freelancers see gig and send counter offers
    ↓

3️⃣  NEGOTIATE AMOUNT
    ↓
    Student and freelancer counter each other
    until agreement
    ↓

4️⃣  BOTH ACCEPT
    ↓
    Offer status changes to "ACCEPTED"
    ↓

5️⃣  MAKE PAYMENT
    ↓
    Student enters card details
    Stripe holds amount (not charged yet)
    ↓

6️⃣  FREELANCER DELIVERS
    ↓
    Freelancer submits work link
    ↓

7️⃣  REVIEW & ACCEPT
    ↓
    Student reviews delivery
    Student clicks "Accept & Release Payment"
    ↓

8️⃣  PAYMENT CHARGED
    ↓
    Card is charged
    Money transferred to freelancer
    ↓

✅  GIG COMPLETE
    ↓
    Student can rate freelancer
    Freelancer can withdraw payment
```

---

## Important Student Notes

### ✓ Always Review Before Accepting
- Click the delivery link
- Verify work quality
- Make sure it matches gig description
- Only accept if fully satisfied

### ✓ Negotiation is Normal
- Don't feel pressured to accept first offer
- Counter with your preferred price
- Freelancers expect negotiation
- Find fair middle ground

### ✓ Payment is Protected
- Escrow holds protect your money
- Card not charged until you accept delivery
- You have full control
- Can reject and work with freelancer

### ✓ Communication
- Be clear in gig description
- Respond to freelancer offers quickly
- Ask questions if unclear
- Provide feedback after delivery

### ✓ Multiple Offers Welcome
- Multiple freelancers can bid
- Accept any offer you like
- Can have negotiations with multiple freelancers
- Choose best value

---

## Troubleshooting

### Q: No freelancers are sending offers?
**A:** Make sure:
- Gig domain matches freelancer skills
- Budget is reasonable
- Description is clear and detailed

### Q: Freelancer keeps raising price?
**A:** You can:
- Counter with lower amount
- Reject and try another freelancer
- Clearly state your max budget in gig description

### Q: Payment not going through?
**A:** Check:
- Card isn't expired
- Card supports Stripe
- Using test card (4242 4242 4242 4242) in development

### Q: Delivery quality is poor?
**A:** You can:
- NOT accept delivery
- Hold remains on card
- Request freelancer fix or provide new delivery
- Reject offer if unsatisfied

---

**Version**: 1.0.0
**Created**: December 7, 2025
**Status**: Ready for Students
