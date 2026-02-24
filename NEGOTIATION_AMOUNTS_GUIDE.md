# Gig Negotiation Amount System (+50/-50 PKR Buttons)

## Overview

The negotiation system uses a simple increment/decrement mechanism where each button press changes the amount by exactly **50 PKR (Pakistan Rupees)**.

## How It Works

### In GigNegotiation.jsx Component

```javascript
const handleIncrement = () => {
  setOfferAmount(prev => prev + 50);
};

const handleDecrement = () => {
  if (offerAmount - 50 >= 0) {
    setOfferAmount(prev => prev - 50);
  }
};
```

**Features:**
- ✓ **+50 PKR Button**: Adds 50 to current amount
- ✓ **-50 PKR Button**: Subtracts 50 from current amount (minimum 0)
- ✓ **Real-time Display**: Amount updates instantly
- ✓ **Validation**: Prevents negative amounts

### Visual Example

```
Original Gig Budget: 5000 PKR

Student sees: PKR 5000 (original budget)
                  ↓
Freelancer clicks: [-50 PKR] [+50 PKR]
                  ↓
Freelancer sends: 4950 PKR counter offer

Student sees: PKR 4950 (freelancer's offer)
                  ↓
Student clicks: [-50 PKR] [+50 PKR]
                  ↓
Student counters: 5000 PKR (back to original)

Freelancer sees: PKR 5000 (student's counter)
                  ↓
Freelancer clicks: [+50 PKR] [+50 PKR] [+50 PKR]
                  ↓
Freelancer sends: 5150 PKR

Student sees: PKR 5150 (new counter)
                  ↓
Student clicks: [-50 PKR]
                  ↓
Student sends: 5100 PKR

Freelancer sees: PKR 5100
                  ↓
Freelancer clicks: [+50 PKR]
                  ↓
Freelancer sends: 5150 PKR (but same as last)
                  ↓
Student accepts: 5150 PKR ✓

✓ AGREED AMOUNT: PKR 5150
```

## Amount Progression

Starting from budget of 5000 PKR:

```
5000  (original)
4950  [-50]
4900  [-50] [-50]
4850  [-50] [-50] [-50]
...
5000  (original)
5050  [+50]
5100  [+50] [+50]
5150  [+50] [+50] [+50]
5200  [+50] [+50] [+50] [+50]
...
```

## Why 50 PKR?

**Advantages:**
- ✓ **Fine-grained control**: Not too big, not too small
- ✓ **Quick negotiation**: Easy to find middle ground
- ✓ **Realistic pricing**: Matches typical negotiation increments
- ✓ **Mobile-friendly**: Easy to tap buttons repeatedly
- ✓ **Currency appropriate**: 50 PKR ≈ $0.18 USD (reasonable increment)

## Customization

To change increment amount, modify in **GigNegotiation.jsx**:

```javascript
// Change from 50 to your desired amount
const NEGOTIATION_INCREMENT = 100; // For 100 PKR increments

const handleIncrement = () => {
  setOfferAmount(prev => prev + NEGOTIATION_INCREMENT);
};

const handleDecrement = () => {
  if (offerAmount - NEGOTIATION_INCREMENT >= 0) {
    setOfferAmount(prev => prev - NEGOTIATION_INCREMENT);
  }
};
```

## Negotiation History Tracking

Each offer update is stored with amount:

```javascript
negotiationHistory: [
  {
    updatedBy: "freelancer",
    amount: 4950,
    timestamp: "2025-12-07T10:15:00Z",
    comment: "Initial counter offer"
  },
  {
    updatedBy: "student",
    amount: 5000,
    timestamp: "2025-12-07T10:20:00Z",
    comment: "Counter offer"
  },
  {
    updatedBy: "freelancer",
    amount: 5050,
    timestamp: "2025-12-07T10:25:00Z",
    comment: "Counter offer"
  },
  {
    updatedBy: "student",
    amount: 5150,
    timestamp: "2025-12-07T10:30:00Z",
    comment: "Counter offer"
  }
]
```

## Frontend Display

The GigNegotiation component shows:

```
┌─────────────────────────────────────────┐
│  💰 Send Counter Offer                  │
├─────────────────────────────────────────┤
│                                         │
│  Counter Offer Amount                   │
│  PKR 4950                               │
│                                         │
│  Original Budget: PKR 5000              │
│                                         │
│  [    -50 PKR    ] [    +50 PKR    ]   │
│                                         │
│  [  Send Counter Offer  ]               │
│                                         │
└─────────────────────────────────────────┘
```

## Backend Update Endpoint

When amount changes, the backend records it:

```bash
PUT /api/v1/gig-offers/:offerId/update-amount
Body: {
  "newAmount": 4950,
  "updatedBy": "freelancer",
  "comment": "Initial counter offer"
}
```

The controller updates:

```javascript
offer.negotiationHistory.push({
  updatedBy,
  amount: newAmount,
  comment
});
offer.offeredAmount = newAmount;
```

## Student Dashboard Display

In StudentGigOffers component, shows negotiation history:

```
Offer from: Ahmed (Freelancer)
Status: PENDING

💼 Freelancer Offers: PKR 4950

🔄 Negotiation History
├─ Freelancer: PKR 4950 - Initial counter offer
├─ Student: PKR 5000 - Counter offer
├─ Freelancer: PKR 5050 - Counter offer
└─ Student: PKR 5150 - Counter offer

Negotiate Amount
[Enter amount] [Counter]

[  Accept  ] [ Reject ]
```

## Amount Constraints

The system enforces:

1. **Minimum Amount**: 0 PKR (can't go below 0)
2. **Maximum Amount**: Unlimited (freelancer can offer any amount)
3. **Increment**: Exactly 50 PKR per button press
4. **Precision**: Whole numbers only (no decimals like 4950.50)

## Workflow with Amounts

```
1. FREELANCER SENDS OFFER
   Initial Amount: 5000 (original)
   After [-50]: 4950 PKR
   Action: Send Counter Offer

2. STUDENT SEES OFFER
   Current Amount: 4950 PKR
   Original Budget: 5000 PKR
   Student clicks: [+50]
   New Amount: 5000 PKR
   Action: Send Counter

3. FREELANCER SEES COUNTER
   Current Amount: 5000 PKR
   Freelancer clicks: [+50] [+50]
   New Amount: 5100 PKR
   Action: Send Counter

4. BOTH AGREE
   Final Amount: 5100 PKR
   Action: Accept Offer

5. PAYMENT
   Amount Held: PKR 5100
   Stripe creates payment intent for 510000 cents

6. DELIVERY
   Freelancer submits work
   Amount: PKR 5100

7. RELEASE PAYMENT
   Student accepts
   Stripe charges: PKR 5100
   Freelancer receives: PKR 5100 (minus platform fee if applicable)
```

## Testing Negotiation

**Test Scenario 1: Quick Agreement**
```
Gig Budget: 5000 PKR
Freelancer: 5000 (same) → Send
Student: Accept ✓
Payment: 5000 PKR
```

**Test Scenario 2: Down Negotiation**
```
Gig Budget: 5000 PKR
Freelancer: [-50][-50][-50] = 4850 → Send
Student: Accept ✓
Payment: 4850 PKR
```

**Test Scenario 3: Extended Negotiation**
```
Gig Budget: 5000 PKR
Freelancer: [-50][-50] = 4900 → Send
Student: [+50][+50][+50] = 5150 → Counter
Freelancer: [-50] = 5100 → Counter
Student: Accept ✓
Payment: 5100 PKR
```

## Performance Considerations

- Each amount change triggers UI update (instant)
- Each offer submission makes API call
- Negotiation history stored in MongoDB array
- No performance issues with large negotiation histories
- UI remains responsive with rapid button clicks

---

**Version**: 1.0.0
**Created**: December 7, 2025
**Status**: Production Ready
