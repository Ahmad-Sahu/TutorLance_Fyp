const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "tutorlance_profiles";

export async function uploadToCloudinary(file) {
  if (!file) return null;
  if (!CLOUD_NAME) {
    console.warn("VITE_CLOUDINARY_CLOUD_NAME not set. Add it to .env for profile image upload.");
    return null;
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Upload failed");
  }
  const data = await response.json();
  return data.secure_url || null;
}
