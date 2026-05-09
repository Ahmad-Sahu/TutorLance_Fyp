# Quick Test Checklist - Offers System

## Pre-Flight Checks ✈️
- [ ] Backend running: `npm start` (from backend/ folder)
- [ ] Frontend running: `npm run dev` (from frontend/ folder, should be on port 5175)
- [ ] MongoDB connection working (no errors in backend console)

---

## 1️⃣ Create Test Gig (Student)

**Login as Student:**
```
Email: student@example.com (or any existing student)
Password: (correct password)
```

**Create Gig:**
- Click: **My Gigs** → **Create New Gig**
- Title: `Test Web Design` (or any title)
- Domain: **Web Design** (or match freelancer's domain)
- Budget: `350` PKR
- Click: **Create**
- ✅ Verify gig appears in list

---

## 2️⃣ Quick Apply as Freelancer

**Logout & Login as Freelancer:**
```
Email: freelancer@example.com (or existing freelancer with matching domain)
Password: (correct password)
```

**Quick Apply:**
- Click: **Available Gigs**
- Find your test gig (should show student name, NOT "Unknown Student")
- Click: **Quick Apply** button
- ✅ Should see success alert

---

## 3️⃣ View Offers as Student

**Logout & Login as Student:**
```
Email: student@example.com (same student from Step 1)
Password: (correct password)
```

**View Offers:**
- Click: **My Gigs**
- Click: **Negotiations** tab
- Click on your test gig from the list
- ✅ **Should see offer** in StudentGigOffers component:
  - Freelancer name showing
  - Amount: PKR 350
  - Status: PENDING
  - ✅ Accept/Reject buttons visible

**If no offers appear:**
- Click: **Refresh** button (spinning icon with "Refresh" text)
- Wait for spinner to stop
- ✅ Offers should appear after refresh

---

## 🐛 Debug

**Check if offer exists in database:**
- Open: `http://localhost:4001/api/v1/gig-offers/debug/all`
- ✅ Should list all offers
- ✅ Find your test offer with correct gigId, studentId, freelancerName

**Check Backend Logs:**
- Look at backend terminal when freelancer clicks Quick Apply
- ✅ Should see: `📝 Creating offer for gig...`
- ✅ Should see: `✅ Offer created successfully`

**Check Frontend Logs (Browser Console - F12):**
- When StudentGigOffers component loads:
- ✅ Should see: `🔍 Fetching offers for gigId: ... studentId: ...`
- ✅ Should see: `✅ Offers fetched: 1 offers`

---

## ✅ Success Indicators

| Check | Expected | Status |
|-------|----------|--------|
| Student name in Available Gigs | Shows actual name, not "Unknown Student" | ✅ |
| Quick Apply button works | Offer created in database | ✅ |
| StudentGigOffers component loads | No console errors | ✅ |
| Offers appear to student | Freelancer name + amount visible | ✅ |
| Refresh button works | Shows spinner, fetches fresh data | ✅ |
| Debug endpoint shows offer | Can see offer with correct IDs | ✅ |
| Backend logs show activity | Logs visible when creating/fetching | ✅ |
| Accept/Reject buttons present | Student can respond to offer | ✅ |

---

## 🚀 Next Steps After Verification

1. **Test Counter-Offers**: Student updates amount → freelancer sees negotiation history
2. **Test Accept**: Student clicks Accept → status changes to PENDING_PAYMENT
3. **Test Reject**: Student clicks Reject → status changes to REJECTED
4. **Test Auto-Refresh** (Optional): Set up WebSocket or polling for real-time updates

---

**Status**: Ready to test! All components in place. ✅
