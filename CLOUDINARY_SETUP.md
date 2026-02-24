# Cloudinary Setup Guide

Follow these steps to enable image uploads in the Freelancer Info Form.

## Step 1: Create a Cloudinary Account
1. Go to https://cloudinary.com
2. Click "Sign Up Free"
3. Fill in your details and create your account
4. Verify your email

## Step 2: Get Your Cloud Name
1. After login, you'll see your **Cloudinary Dashboard**
2. Look for **"Cloud Name"** at the top of the page (it looks like a small badge)
3. Copy your Cloud Name (e.g., `demo` or `your-unique-name`)

## Step 3: Create an Upload Preset
1. In the dashboard, go to **Settings** (gear icon)
2. Click on the **Upload** tab
3. Scroll to **Upload Presets** section
4. Click **"Add upload preset"**
5. Set the following:
   - **Name**: `tutorLance` (or any name you prefer)
   - **Unsigned**: Turn ON (toggle to "Signed" must be OFF)
   - Click **"Save"**
6. Your upload preset name should now appear in the list

## Step 4: Configure in Your Frontend
1. Open `frontend/.env.local`
2. Fill in your credentials:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=tutorLance
   ```
   Replace `your_cloud_name_here` with your actual Cloud Name from Step 2

## Step 5: Restart the Frontend
1. Stop the frontend dev server (Ctrl+C)
2. Run: `npm run dev`
3. The new environment variables will be loaded

## Step 6: Test
1. Sign up as a freelancer
2. Fill the profile form
3. Upload profile picture and CNIC image
4. Click "Save Profile"
5. Images should upload successfully to Cloudinary
6. Profile will display in the dashboard with images

## Troubleshooting

### "Cloudinary not configured" warning
- Make sure both `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are set in `.env.local`
- Restart the dev server after changing `.env.local`

### Upload fails with "401 Unauthorized"
- Check that your **Upload Preset is set to UNSIGNED** (not Signed)
- Verify the upload preset name matches exactly in `.env.local`
- Make sure you're using the correct Cloud Name

### Profile shows empty fields
- Profile is saved in localStorage after fill
- Refresh the dashboard page if fields don't appear
- Check browser DevTools > Application > LocalStorage > "freelancer" key

---

**Need help?** Check your Cloudinary dashboard at https://cloudinary.com/console
