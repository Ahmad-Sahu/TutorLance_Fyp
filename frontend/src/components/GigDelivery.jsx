import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { FaYoutube, FaCheck, FaTimes, FaFile } from "react-icons/fa";

const GigDelivery = ({ offer, onDeliverySubmit, isFreelancer = false }) => {
  const [deliveryLink, setDeliveryLink] = useState(offer?.deliveryLink || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "http://localhost:3000/api/v1/gig-offers";

  const handleSubmitDelivery = async () => {
    try {
      if (!deliveryLink.trim()) {
        setError("Please provide a delivery link");
        return;
      }

      setLoading(true);
      setError("");

      const response = await axios.put(`${BASE_URL}/${offer._id}/deliver`, {
        deliveryLink: deliveryLink.trim()
      });

      toast.success("✅ Gig delivered successfully!");
      onDeliverySubmit(response.data.offer);
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting delivery");
      alert("❌ " + (err.response?.data?.message || "Error submitting delivery"));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.put(`${BASE_URL}/${offer._id}/accept-delivery`);

      toast.success("✅ Delivery accepted! Payment released to freelancer.");
      onDeliverySubmit(response.data.offer);
    } catch (err) {
      setError(err.response?.data?.message || "Error accepting delivery");
      alert("❌ " + (err.response?.data?.message || "Error accepting delivery"));
    } finally {
      setLoading(false);
    }
  };

  // Freelancer submission view
  if (isFreelancer && offer.status !== "delivered") {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📤 Submit Your Delivery</h3>

        <div className="bg-white rounded-lg p-4 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaYoutube className="inline mr-2" /> YouTube Link or File URL
          </label>
          <input
            type="url"
            value={deliveryLink}
            onChange={(e) => setDeliveryLink(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc ml-5 mt-2">
            <li>Upload your video/document to YouTube or Google Drive</li>
            <li>Share the public link here</li>
            <li>Student will review and accept your delivery</li>
            <li>Payment will be released after acceptance</li>
          </ul>
        </div>

        {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">⚠️ {error}</div>}

        <button
          onClick={handleSubmitDelivery}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <FaCheck /> {loading ? "Submitting..." : "Submit Delivery"}
        </button>
      </div>
    );
  }

  // Student review view
  if (offer.status === "delivered" && !isFreelancer) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🎬 Review Delivery</h3>

        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Freelancer Submitted:</p>
          <a
            href={offer.deliveryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-2"
          >
            <FaFile /> View Delivery
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Delivered on: {new Date(offer.deliveredAt).toLocaleDateString("en-GB", { 
              day: "2-digit", 
              month: "2-digit", 
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
          <p className="mb-2">✓ Review the delivery link above</p>
          <p className="mb-2">✓ If satisfied, click "Accept & Release Payment"</p>
          <p>✓ Amount PKR {offer.offeredAmount} will be released to freelancer</p>
        </div>

        {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">⚠️ {error}</div>}

        <button
          onClick={handleAcceptDelivery}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <FaCheck /> {loading ? "Processing..." : "Accept & Release Payment"}
        </button>
      </div>
    );
  }

  // Completed view
  if (offer.status === "completed") {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300">
        <div className="flex items-center gap-3 mb-4">
          <FaCheck className="text-3xl text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">Gig Completed</h3>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Delivery Link:</p>
          <a
            href={offer.deliveryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {offer.deliveryLink}
          </a>
          <p className="text-sm text-gray-600 mt-4">
            Amount Released: <span className="text-lg font-bold text-green-600">PKR {offer.offeredAmount}</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default GigDelivery;
