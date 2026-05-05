import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { sanitizeNameInput, validateName } from "../utils/authValidation";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

const toDobInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("/")) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const FreelancerInfoForm = ({
  initialData = {},
  editMode = false,
  onSave,
  onCancel,
}) => {
  const navigate = useNavigate();
  const storedProfileCompleted = (() => {
    try {
      return Boolean(JSON.parse(localStorage.getItem("freelancer") || "{}")?.profileCompleted);
    } catch {
      return false;
    }
  })();
  const isExistingProfile = Boolean(editMode || initialData?.profileCompleted || storedProfileCompleted);

  const [form, setForm] = useState({
    name: "",
    dob: "",
    cnicNumber: "",
    domain: "",
    skills: "",
    status: "Available",
    description: "",
    youtubeUrl: "",
    picture: "",
    cnicImage: "",
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [cnicFile, setCnicFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const sourceData =
      initialData && Object.keys(initialData).length > 0
        ? initialData
        : (() => {
            try {
              const profile = JSON.parse(localStorage.getItem("freelancer") || "null");
              const draft = JSON.parse(localStorage.getItem("freelancerFormDraft") || "null");
              if (profile?.profileCompleted) return profile;
              if (draft && Object.keys(draft).length > 0) return draft;
              return profile || {};
            } catch {
              return {};
            }
          })();

    setForm({
      name:
        sourceData.name ||
        [sourceData.firstname || sourceData.firstName, sourceData.lastname || sourceData.lastName]
          .filter(Boolean)
          .join(" "),
      dob: toDobInput(sourceData.dob),
      cnicNumber: sourceData.cnicNumber || "",
      domain: sourceData.domain || "",
      skills: sourceData.skills || "",
      status: sourceData.status || "Available",
      description: sourceData.description || "",
      youtubeUrl: sourceData.youtubeUrl || "",
      picture: sourceData.picture || "",
      cnicImage: sourceData.cnicImage || "",
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("freelancerFormDraft", JSON.stringify(form));
  }, [form]);

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) return null;

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(url, { method: "POST", body: data });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const json = await res.json();
    return json.secure_url || json.url || null;
  };

  const validateWordField = (label, value, maxLength) => {
    const trimmed = value.trim();
    if (!trimmed) return `${label} is required.`;
    if (trimmed.length > maxLength) return `${label} must not exceed ${maxLength} characters.`;
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(trimmed)) {
      return `${label} must contain only letters and single spaces.`;
    }
    return "";
  };

  const validateSkills = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Skills is required.";
    if (trimmed.length > 100) return "Skills must not exceed 100 characters.";
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*(?:\s*,\s*[A-Za-z]+(?: [A-Za-z]+)*)*$/.test(trimmed)) {
      return "Skills must contain only letters and commas (e.g. React, Node, Python).";
    }
    return "";
  };

  const validateDob = (value) => {
    if (!value.trim()) return "Date of birth is required.";
    const parts = value.split("/");
    if (parts.length !== 3) return "Date of birth must be in dd/mm/yyyy format.";
    const [day, month, year] = parts.map((part) => Number(part));
    if (!day || !month || !year) return "Date of birth must be valid.";
    const parsed = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    if (Number.isNaN(parsed.getTime())) return "Date of birth must be valid.";
    return "";
  };

  const validateCnic = (value) => {
    if (!value.trim()) return "CNIC number is required.";
    if (!/^\d{5}-\d{7}-\d{1}$/.test(value.trim())) {
      return "CNIC number must be in 12345-1234567-1 format.";
    }
    return "";
  };

  const validateYoutubeUrl = (value) => {
    if (!value.trim()) return "";
    try {
      new URL(value);
      return "";
    } catch {
      return "YouTube URL must be valid.";
    }
  };

  const parseDob = (dobStr) => {
    const [d, m, y] = dobStr.split("/").map((p) => parseInt(p, 10));
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "name") value = sanitizeNameInput(value).slice(0, 31);
    if (name === "domain") value = value.replace(/[^A-Za-z ]/g, "").replace(/\s+/g, " ").replace(/^ /, "").slice(0, 30);
    if (name === "skills") value = value.replace(/[^A-Za-z ,]/g, "").replace(/ {2,}/g, " ").replace(/^[ ,]+/, "").slice(0, 100);
    if (name === "description") value = value.replace(/\s+/g, " ").replace(/^ /, "").slice(0, 500);
    if (name === "cnicNumber") value = value.replace(/[^\d-]/g, "").slice(0, 15);

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameParts = form.name.trim().split(" ").filter(Boolean);
    const nextErrors = {
      name:
        nameParts.length < 2
          ? "Full name must include first name and last name."
          : nameParts.some((part) => validateName("Name", part))
            ? "Each part of the full name must be 2-15 letters."
            : "",
      dob: validateDob(form.dob),
      cnicNumber: validateCnic(form.cnicNumber),
      cnicImage: (!form.cnicImage && !cnicFile) ? "CNIC image is required." : "",
      domain: validateWordField("Domain", form.domain, 30),
      skills: validateSkills(form.skills),
      description: validateWordField("Description", form.description, 500),
      youtubeUrl: validateYoutubeUrl(form.youtubeUrl),
    };
    setErrors(nextErrors);

    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      toast.error(firstError);
      return;
    }

    setSubmitting(true);
    try {
      const freelancerId = localStorage.getItem("freelancerId");
      if (!freelancerId) {
        toast.error("Freelancer ID missing. Please login again.");
        return;
      }

      let pictureUrl = form.picture || "";
      let cnicImageUrl = form.cnicImage || "";
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
        if (pictureFile) pictureUrl = await uploadToCloudinary(pictureFile);
        if (cnicFile) cnicImageUrl = await uploadToCloudinary(cnicFile);
      }

      const payload = {
        name: form.name.trim(),
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
        dob: parseDob(form.dob),
        picture: pictureUrl,
        cnicNumber: form.cnicNumber.trim(),
        cnicImage: cnicImageUrl,
        domain: form.domain.trim(),
        skills: form.skills.trim(),
        status: form.status,
        description: form.description.trim(),
        youtubeUrl: form.youtubeUrl.trim(),
        profileCompleted: true,
      };

      let savedFreelancer;
      if (onSave) {
        savedFreelancer = await onSave(payload);
      } else {
        const response = await axios.put(`http://localhost:3000/api/v1/freelancers/${freelancerId}`, payload);
        savedFreelancer = response.data;
      }

      if (savedFreelancer) {
        localStorage.setItem("freelancer", JSON.stringify(savedFreelancer));
        localStorage.removeItem("freelancerFormDraft");
      }

      localStorage.setItem("freelancerProfileCompleted", "true");
      toast.success(editMode ? "Profile updated successfully." : "Profile saved.");

      if (!onSave) {
        navigate("/freelancerdashboard");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(" ")
          : "Failed to save profile. Check console for details.");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={editMode ? "" : "p-6 max-w-2xl mx-auto bg-white rounded shadow mt-8"}>
      <h2 className="text-2xl font-bold mb-4">
        {isExistingProfile ? "Update Freelancer Profile" : "Complete Your Freelancer Profile"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded p-2" required />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-semibold">Date of Birth (dd/mm/yyyy)</label>
          <input name="dob" value={form.dob} onChange={handleChange} className="w-full border rounded p-2" placeholder="DD/MM/YYYY" required />
          {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
        </div>

        <div>
          <label className="block font-semibold">Profile Picture</label>
          <input type="file" accept="image/*" onChange={(e) => setPictureFile(e.target.files?.[0] || null)} />
          {form.picture && !pictureFile && <img src={form.picture} alt="Profile" className="mt-2 h-20 w-20 object-cover rounded-lg border" />}
        </div>

        <div>
          <label className="block font-semibold">CNIC Number <span className="text-red-500">*</span></label>
          <input name="cnicNumber" value={form.cnicNumber} onChange={handleChange} className="w-full border rounded p-2" placeholder="12345-1234567-1" required />
          {errors.cnicNumber && <p className="text-red-500 text-xs mt-1">{errors.cnicNumber}</p>}
        </div>

        <div>
          <label className="block font-semibold">CNIC Image <span className="text-red-500">*</span></label>
          <input type="file" accept="image/*" onChange={(e) => { setCnicFile(e.target.files?.[0] || null); setErrors((prev) => ({ ...prev, cnicImage: "" })); }} />
          {form.cnicImage && !cnicFile && <img src={form.cnicImage} alt="CNIC" className="mt-2 h-20 w-28 object-cover rounded-lg border" />}
          {errors.cnicImage && <p className="text-red-500 text-xs mt-1">{errors.cnicImage}</p>}
        </div>

        <div>
          <label className="block font-semibold">Domain</label>
          <select
            name="domain"
            value={form.domain}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
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
          {errors.domain && <p className="text-red-500 text-xs mt-1">{errors.domain}</p>}
        </div>

        <div>
          <label className="block font-semibold">Skills</label>
          <input name="skills" value={form.skills} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. React, Node.js, Python" required />
          <p className="text-gray-400 text-xs mt-1">Separate multiple skills with commas</p>
          {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
        </div>

        <div>
          <label className="block font-semibold">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2" required>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Short Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" rows={4} required />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block font-semibold">YouTube URL (optional)</label>
          <input name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} className="w-full border rounded p-2" placeholder="https://youtube.com/..." />
          {errors.youtubeUrl && <p className="text-red-500 text-xs mt-1">{errors.youtubeUrl}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
            {submitting ? "Saving..." : isExistingProfile ? "Save Changes" : "Save Profile"}
          </button>
          {editMode && onCancel && (
            <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FreelancerInfoForm;
