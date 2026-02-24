import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, BookOpen, DollarSign, Briefcase, UserCheck, MessageSquare, Star } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-hot-toast";

const API = "http://localhost:3000/api/v1";
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
const COLORS = ["#4F46E5", "#22C55E", "#EAB308", "#EF4444", "#3B82F6", "#8B5CF6"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState({ tutors: 0, students: 0, freelancers: 0, bookings: 0, completedBookings: 0, totalPayments: 0 });
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [tutorsWithRatings, setTutorsWithRatings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [complaintResponse, setComplaintResponse] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    axios.post(`${API}/payments/process-expired`).catch(() => {});
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const r = await axios.get(`${API}/admin/stats`, auth());
      setStats(r.data);
    } catch (e) {
      if (e.response?.status === 401) navigate("/login");
    }
  };

  useEffect(() => {
    if (activeSection === "users") {
      axios.get(`${API}/admin/users`, auth()).then((r) => {
        setTutors(r.data.tutors || []);
        setStudents(r.data.students || []);
        setFreelancers(r.data.freelancers || []);
      }).catch(() => {});
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "bookings") {
      const q = bookingStatusFilter ? `?status=${bookingStatusFilter}` : "";
      axios.get(`${API}/admin/bookings${q}`, auth()).then((r) => setBookings(r.data.bookings || [])).catch(() => {});
    }
  }, [activeSection, bookingStatusFilter]);

  useEffect(() => {
    if (activeSection === "complaints") {
      axios.get(`${API}/complaints/admin`, auth()).then((r) => setComplaints(r.data.complaints || [])).catch(() => {});
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "ratings") {
      axios.get(`${API}/admin/tutors-ratings`, auth()).then((r) => setTutorsWithRatings(r.data.tutors || [])).catch(() => {});
    }
  }, [activeSection]);

  const removeUser = async (role, userId) => {
    if (!window.confirm("Remove this user permanently?")) return;
    try {
      await axios.delete(`${API}/admin/users/${role}/${userId}`, auth());
      toast.success("User removed");
      const r = await axios.get(`${API}/admin/users`, auth());
      setTutors(r.data.tutors || []);
      setStudents(r.data.students || []);
      setFreelancers(r.data.freelancers || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const releasePayment = async (bookingId) => {
    try {
      await axios.post(`${API}/admin/payments/release/${bookingId}`, {}, auth());
      toast.success("Payment released to tutor");
      fetchStats();
      const q = bookingStatusFilter ? `?status=${bookingStatusFilter}` : "";
      axios.get(`${API}/admin/bookings${q}`, auth()).then((r) => setBookings(r.data.bookings || []));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const refundPayment = async (bookingId) => {
    try {
      await axios.post(`${API}/admin/payments/refund/${bookingId}`, {}, auth());
      toast.success("Payment refunded to student");
      fetchStats();
      const q = bookingStatusFilter ? `?status=${bookingStatusFilter}` : "";
      axios.get(`${API}/admin/bookings${q}`, auth()).then((r) => setBookings(r.data.bookings || []));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const closeComplaint = async (id, response) => {
    try {
      await axios.put(`${API}/complaints/admin/${id}`, { status: "closed", adminResponse: response }, auth());
      toast.success("Complaint closed");
      axios.get(`${API}/complaints/admin`, auth()).then((r) => setComplaints(r.data.complaints || []));
      setComplaintResponse((p) => ({ ...p, [id]: "" }));
    } catch (e) {
      toast.error("Failed");
    }
  };

  const chartData = [
    { name: "Tutors", value: stats.tutors },
    { name: "Students", value: stats.students },
    { name: "Freelancers", value: stats.freelancers },
    { name: "Bookings", value: stats.bookings },
    { name: "Completed", value: stats.completedBookings },
    { name: "Payments", value: stats.totalPayments },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-gray-900 relative z-0 isolate">
      <aside className="w-64 bg-indigo-700 text-white flex flex-col p-6 shrink-0 relative z-10">
        <h1 className="text-2xl font-bold mb-6">TutorLance Admin</h1>
        <nav className="space-y-1">
          {[
            ["dashboard", "Dashboard", <Users className="w-5 h-5" />],
            ["users", "Users", <UserCheck className="w-5 h-5" />],
            ["bookings", "Bookings & Classes", <BookOpen className="w-5 h-5" />],
            ["complaints", "Complaints", <MessageSquare className="w-5 h-5" />],
            ["ratings", "Ratings & Reviews", <Star className="w-5 h-5" />],
          ].map(([key, label, icon]) => (
            <button key={key} type="button" onClick={() => setActiveSection(key)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${activeSection === key ? "bg-indigo-600" : "hover:bg-indigo-600"}`}>
              {icon} {label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="mt-6 text-red-300 hover:text-white cursor-pointer">Logout</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        {activeSection === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-8 text-indigo-700">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Tutors", value: stats.tutors, icon: <Users className="text-indigo-600" /> },
                { label: "Students", value: stats.students, icon: <BookOpen className="text-green-600" /> },
                { label: "Freelancers", value: stats.freelancers, icon: <Briefcase className="text-yellow-500" /> },
                { label: "Bookings", value: stats.bookings, icon: <UserCheck className="text-blue-500" /> },
                { label: "Completed Sessions", value: stats.completedBookings, icon: <DollarSign className="text-pink-500" /> },
                { label: "Total Payments (PKR)", value: stats.totalPayments, icon: <DollarSign className="text-purple-600" /> },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                  <div><h2 className="text-gray-600 font-medium">{item.label}</h2><p className="text-2xl font-bold">{item.value}</p></div>
                  <div className="text-4xl">{item.icon}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart><Pie dataKey="value" data={chartData} outerRadius={100} fill="#8884d8" label />{chartData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}<Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeSection === "users" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <div className="space-y-8">
              <section className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Tutors ({tutors.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-indigo-50"><th className="p-2 border">Name</th><th className="p-2 border">Email</th><th className="p-2 border">Actions</th></tr></thead>
                    <tbody>
                      {tutors.map((u) => (
                        <tr key={u._id}><td className="p-2 border">{u.firstName} {u.lastName}</td><td className="p-2 border">{u.email}</td>
                          <td className="p-2 border"><a href={`/tutor/${u._id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 mr-2 cursor-pointer hover:underline">View profile</a><button type="button" onClick={() => removeUser("tutor", u._id)} className="text-red-600 cursor-pointer hover:underline">Remove</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Students ({students.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-indigo-50"><th className="p-2 border">Name</th><th className="p-2 border">Email</th><th className="p-2 border">Actions</th></tr></thead>
                    <tbody>
                      {students.map((u) => (
                        <tr key={u._id}><td className="p-2 border">{u.firstName} {u.lastName}</td><td className="p-2 border">{u.email}</td>
                          <td className="p-2 border"><button type="button" onClick={() => removeUser("student", u._id)} className="text-red-600 cursor-pointer hover:underline">Remove</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Freelancers ({freelancers.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-indigo-50"><th className="p-2 border">Name</th><th className="p-2 border">Email</th><th className="p-2 border">Actions</th></tr></thead>
                    <tbody>
                      {freelancers.map((u) => (
                        <tr key={u._id}><td className="p-2 border">{u.firstname} {u.lastname}</td><td className="p-2 border">{u.email}</td>
                          <td className="p-2 border"><button type="button" onClick={() => removeUser("freelancer", u._id)} className="text-red-600 cursor-pointer hover:underline">Remove</button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}

        {activeSection === "bookings" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Bookings & Classes</h1>
            <div className="mb-4 flex gap-2">
              <select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)} className="border rounded px-3 py-2 cursor-pointer bg-white">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="negotiating">Negotiating</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-indigo-50"><th className="p-2 border">Student</th><th className="p-2 border">Tutor</th><th className="p-2 border">Subject</th><th className="p-2 border">PKR</th><th className="p-2 border">Status</th><th className="p-2 border">Payment</th><th className="p-2 border">Actions</th></tr></thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="p-2 border">{b.studentId?.firstName} {b.studentId?.lastName}</td>
                      <td className="p-2 border">{b.tutorId?.firstName} {b.tutorId?.lastName}</td>
                      <td className="p-2 border">{b.subject}</td>
                      <td className="p-2 border">{b.proposedPrice}</td>
                      <td className="p-2 border">{b.status}</td>
                      <td className="p-2 border">{b.paymentStatus}</td>
                      <td className="p-2 border">
                        {b.paymentStatus === "captured" && b.status !== "completed" && <button type="button" onClick={() => releasePayment(b._id)} className="text-green-600 mr-2 cursor-pointer hover:underline">Release to tutor</button>}
                        {(b.paymentStatus === "held" || b.paymentStatus === "captured") && <button type="button" onClick={() => refundPayment(b._id)} className="text-red-600 cursor-pointer hover:underline">Refund student</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p className="p-4 text-gray-500">No bookings.</p>}
            </div>
          </>
        )}

        {activeSection === "complaints" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Complaints</h1>
            <div className="space-y-4">
              {complaints.length === 0 ? <p className="text-gray-500">No complaints.</p> : complaints.map((c) => (
                <div key={c._id} className="bg-white rounded-xl shadow p-4">
                  <p className="font-medium">{c.fromRole} — {c.userName}</p>
                  <p className="text-gray-700 mt-1">{c.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(c.createdAt).toLocaleString()} • {c.status}</p>
                  {c.adminResponse && <p className="mt-2 text-indigo-600">Your response: {c.adminResponse}</p>}
                  {c.status === "open" && (
                    <div className="mt-3 flex gap-2">
                      <input type="text" value={complaintResponse[c._id] || ""} onChange={(e) => setComplaintResponse((p) => ({ ...p, [c._id]: e.target.value }))} placeholder="Response to user" className="border rounded px-3 py-2 flex-1" />
                      <button type="button" onClick={() => closeComplaint(c._id, complaintResponse[c._id])} className="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700">Close & Send</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === "ratings" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Ratings & Reviews</h1>
            <div className="space-y-4">
              {tutorsWithRatings.length === 0 ? <p className="text-gray-500">No tutors.</p> : tutorsWithRatings.map((t) => (
                <div key={t._id} className="bg-white rounded-xl shadow p-4">
                  <p className="font-semibold">{t.firstName} {t.lastName} — ⭐ {t.averageRating?.toFixed(1) || "0"} ({t.totalReviews || 0} reviews)</p>
                  {(t.ratings || []).length > 0 && (
                    <div className="mt-2 pl-4 space-y-1 text-sm text-gray-600">
                      {t.ratings.slice().reverse().slice(0, 5).map((r, i) => (
                        <p key={i}>{r.studentName}: {r.rating}★ — {r.review}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
