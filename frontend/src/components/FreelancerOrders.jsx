import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'

const FreelancerOrders = ({ freelancerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deliveryLink, setDeliveryLink] = useState("");
  const [deliveryFile, setDeliveryFile] = useState(null);

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.warn('⚠️ Cloudinary not configured - skipping file upload');
      return null;
    }
    try {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(url, { method: 'POST', body: data });
      if (!res.ok) {
        const err = await res.json();
        console.error('Cloudinary upload error', err);
        throw new Error(err.error?.message || 'Upload failed');
      }
      const json = await res.json();
      return json.secure_url || json.url || null;
    } catch (err) {
      console.error('❌ Cloudinary error:', err);
      alert('File upload failed: ' + err.message);
      return null;
    }
  };

  const BASE_URL = "http://localhost:3000/api/v1/gig-offers";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/freelancer/${freelancerId}`);
      // Filter offers that have been paid/accepted by students
      const list = res.data.filter(o => o.paymentStatus === "held" || ["accepted","delivered","completed"].includes(o.status));
      setOrders(list);
    } catch (err) {
      console.error("Error fetching freelancer offers/orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (freelancerId) fetchOrders();
  }, [freelancerId]);

  const handleDeliver = async () => {
    if (!deliveryLink) return alert("Please enter delivery link or proof.");
    try {
      await axios.put(`${BASE_URL}/${selected._id}/deliver`, { deliveryLink });
      toast.success("Order sent to student");
      setSelected(null);
      setDeliveryLink("");
      fetchOrders();
    } catch (err) {
      console.error("Error delivering order", err);
      alert("Error delivering order: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">No active orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-bold">{o.freelancerName} — {o.gig?.title || (o.gigTitle || 'Gig')}</div>
                <div className="text-sm text-gray-600">Client: {o.studentName}</div>
                <div className="text-sm text-blue-600 font-semibold">PKR {o.offeredAmount}</div>
                <div className="text-xs">Status: {o.status}</div>                {o.deliveryLink && (
                  <div className="mt-2 text-sm">
                    Delivery: <a href={o.deliveryLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open / Download</a>
                  </div>
                )}              </div>
              <div className="flex gap-2">
                {o.status !== 'delivered' && (
                  <button onClick={() => setSelected(o)} className="bg-blue-600 text-white px-3 py-2 rounded">Send Order</button>
                )}
                {o.status === 'delivered' && <div className="text-green-600 font-semibold">Delivered</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-xl font-bold mb-3">Send Order to {selected.studentName}</h3>
            <input value={deliveryLink} onChange={(e) => setDeliveryLink(e.target.value)} placeholder="Delivery link or proof URL" className="w-full border p-2 rounded mb-3" />

            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">Attach File (optional)</label>
              <input type="file" onChange={(e) => setDeliveryFile(e.target.files[0])} />
              {deliveryFile && <div className="text-sm mt-2">Selected: {deliveryFile.name}</div>}
            </div>

            <div className="text-right">
              <button onClick={() => setSelected(null)} className="px-3 py-2 mr-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={async () => {
                // If a file is chosen, upload first
                let link = deliveryLink;
                if (deliveryFile) {
                  const uploaded = await uploadToCloudinary(deliveryFile);
                  if (uploaded) link = uploaded;
                }
                setDeliveryLink(link);
                await handleDeliver();
              }} className="px-3 py-2 bg-green-600 text-white rounded">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerOrders;