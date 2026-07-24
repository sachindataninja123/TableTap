import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const StatCard = ({ label, value }) => (
  <div className="bg-white border border-[#E7E2D6] rounded-xl p-5">
    <p className="text-[30px] text-[#16281F]" style={{ fontFamily: "'Fraunces', serif" }}>
      {value ?? "—"}
    </p>
    <p className="text-[13px] text-[#5C5C54]">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        setStats(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-5 py-12">
        <h1
          className="text-[32px] text-[#16281F] mb-8"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Platform overview
        </h1>

        {loading ? (
          <p className="text-[#B0AA9C]">Loading...</p>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-3">
                Users
              </p>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total users" value={stats?.users?.total} />
                <StatCard label="Restaurant owners" value={stats?.users?.owners} />
                <StatCard label="Customers" value={stats?.users?.customers} />
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-3">
                Restaurants
              </p>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Pending approval" value={stats?.restaurants?.pending} />
                <StatCard label="Approved" value={stats?.restaurants?.approved} />
                <StatCard label="Rejected" value={stats?.restaurants?.rejected} />
              </div>
            </div>

            <div className="mb-10">
              <p className="text-[13px] uppercase tracking-[0.15em] text-[#B8863B] font-medium mb-3">
                Bookings
              </p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <StatCard label="Pending" value={stats?.bookings?.pending} />
                <StatCard label="Confirmed" value={stats?.bookings?.confirmed} />
                <StatCard label="Completed" value={stats?.bookings?.completed} />
              </div>
              <p className="text-[13px] text-[#5C5C54]">
                {stats?.bookings?.last7Days ?? 0} new bookings in the last 7 days
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/admin/restaurants"
                className="px-5 py-2.5 rounded-full bg-[#16281F] text-[#FDFBF6] text-[13px] font-medium hover:bg-[#3F6B4F] transition-colors"
              >
                Manage restaurants
              </Link>
              <Link
                to="/admin/users"
                className="px-5 py-2.5 rounded-full border border-[#E7E2D6] text-[#16281F] text-[13px] font-medium hover:bg-[#E7E2D6]/30 transition-colors"
              >
                Manage users
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;