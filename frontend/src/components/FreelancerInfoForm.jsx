import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-hot-toast'

// Read from environment variables (Vite uses import.meta.env)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

const FreelancerInfoForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dob: "",
    cnicNumber: "",
    domain: "",
    description: "",
    youtubeUrl: "",
  });

  const [pictureFile, setPictureFile] = useState(null);
  const [cnicFile, setCnicFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    
    // If Cloudinary not configured, skip upload and continue without images
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.warn("⚠️ Cloudinary not configured. Images will not be uploaded. Configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local");
      return null;
    }

    try {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(url, { method: "POST", body: data });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Cloudinary upload error:", errorData);
        throw new Error(errorData.error?.message || "Upload failed");
      }
      
      const json = await res.json();
      console.log("✅ Image uploaded to Cloudinary:", json.secure_url);
      return json.secure_url || json.url || null;
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err.message);
      alert(`Image upload failed: ${err.message}. Profile will be saved without images.`);
      return null;
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const parseDob = (dobStr) => {
    // Expect dd/mm/yyyy format
    if (!dobStr) return null;
    const parts = dobStr.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map((p) => parseInt(p, 10));
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12) return null;
    // Convert to ISO format (yyyy-mm-dd) for MongoDB
    const isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    console.log(`DOB: ${dobStr} → ISO: ${isoDate}`);
    return isoDate;
  };

  const nameRegex = /^[A-Za-z ]+$/;
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate name: only English letters and spaces
    if (!nameRegex.test(form.name)) {
      alert("Name must contain only English letters.");
      setSubmitting(false);
      return;
    }
    setSubmitting(true);

    try {
      const freelancerId = localStorage.getItem("freelancerId");
      if (!freelancerId) {
        alert("Freelancer ID missing. Please login or re-register.");
        setSubmitting(false);
        return;
      }

      // Upload images only if Cloudinary is configured
      let pictureUrl = null;
      let cnicImageUrl = null;
      
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
        pictureUrl = pictureFile ? await uploadToCloudinary(pictureFile) : null;
        cnicImageUrl = cnicFile ? await uploadToCloudinary(cnicFile) : null;
      } else {
        console.log("⚠️ Skipping image uploads: Cloudinary not configured");
      }

      const parsedDob = parseDob(form.dob);
      const payload = {
        name: form.name,
        dob: parsedDob,
        picture: pictureUrl,
        cnicNumber: form.cnicNumber,
        cnicImage: cnicImageUrl,
        domain: form.domain,
        description: form.description,
        youtubeUrl: form.youtubeUrl,
        // also set skills for matching (keep consistent with existing matching logic)
        skills: form.domain,
      };

      const response = await axios.put(`http://localhost:3000/api/v1/freelancers/${freelancerId}`, payload);

      // Store the updated freelancer data in localStorage
      if (response.data) {
        localStorage.setItem("freelancer", JSON.stringify(response.data));
      }

      toast.success("Profile saved. Redirecting to dashboard...");
      localStorage.setItem("freelancerProfileCompleted", "true");
      navigate("/freelancerdashboard");
    } catch (err) {
      console.error("Error saving freelancer profile:", err);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Complete Your Freelancer Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block font-semibold">Date of Birth (dd/mm/yyyy)</label>
          <input name="dob" value={form.dob} onChange={handleChange} className="w-full border rounded p-2" placeholder="DD/MM/YYYY" required />
        </div>

        <div>
          <label className="block font-semibold">Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setPictureFile(e.target.files[0])} />
        </div>

        <div>
          <label className="block font-semibold">CNIC Number</label>
          <input name="cnicNumber" value={form.cnicNumber} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block font-semibold">CNIC Image</label>
          <input type="file" accept="image/*" onChange={(e) => setCnicFile(e.target.files[0])} />
        </div>

        <div>
          <label className="block font-semibold">Domain</label>
          <select name="domain" value={form.domain} onChange={handleChange} className="w-full border rounded p-2" required>
            <option value="">Select Domain</option>
            <option value="Flutter">Flutter</option>
            <option value="Web Development">Web Development</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Python">Python</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Short Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" rows={4} />
        </div>

        <div>
          <label className="block font-semibold">YouTube URL (optional)</label>
          <input name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} className="w-full border rounded p-2" placeholder="https://youtube.com/..." />
        </div>

        <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {submitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default FreelancerInfoForm;
