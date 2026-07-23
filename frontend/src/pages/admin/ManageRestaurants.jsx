import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiCheck, FiX, FiStar, FiAward } from "react-icons/fi";
import {
  fetchAllRestaurantsAdmin,
  approveRestaurant,
  rejectRestaurant,
  toggleFeaturedStatus,
  toggleExclusiveStatus,
} from "../../features/restaurant/restaurantSlice";

const statusColors = {
  pending: "bg-[#B8863B]/15 text-[#B8863B]",
  approved: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  rejected: "bg-[#A63D2F]/15 text-[#A63D2F]",
};

const ManageRestaurants = () => {
  const dispatch = useDispatch();
  const { adminRestaurants, adminLoading, adminActionLoading } = useSelector(
    (state) => state.restaurant
  );
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchAllRestaurantsAdmin(statusFilter ? { status: statusFilter } : {}));
  }, [dispatch, statusFilter]);

  const handleReject = (id) => {
    const reason = window.prompt("Reason for rejection (optional):");
    dispatch(rejectRestaurant({ id, rejectionReason: reason || "" }));
  };

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-5 py-12">
        <h1 className="text-[32px] text-[#16281F] mb-8" style={{ fontFamily: "'Fraunces', serif" }}>
          Manage restaurants
        </h1>

        <div className="flex gap-2 mb-8">
          {["", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[13px] px-4 py-2 rounded-full font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-[#16281F] text-[#FDFBF6]" : "text-[#5C5C54] hover:bg-[#E7E2D6]/50"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {adminLoading ? (
          <p className="text-[#B0AA9C] text-center py-16">Loading...</p>
        ) : adminRestaurants.length === 0 ? (
          <p className="text-[#B0AA9C] text-center py-16">No restaurants found</p>
        ) : (
          <div className="space-y-3">
            {adminRestaurants.map((r) => (
              <div key={r._id} className="bg-white border border-[#E7E2D6] rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] text-[#16281F] font-medium truncate">{r.name}</h3>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5C5C54] truncate">
                    {r.cuisine} · {r.location} · Owner: {r.owner?.name} ({r.owner?.email})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => dispatch(approveRestaurant(r._id))}
                        disabled={adminActionLoading}
                        title="Approve"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#3F6B4F]/15 text-[#3F6B4F] hover:bg-[#3F6B4F] hover:text-white transition-colors disabled:opacity-50"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => handleReject(r._id)}
                        disabled={adminActionLoading}
                        title="Reject"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#A63D2F]/15 text-[#A63D2F] hover:bg-[#A63D2F] hover:text-white transition-colors disabled:opacity-50"
                      >
                        <FiX />
                      </button>
                    </>
                  )}

                  {r.status === "approved" && (
                    <>
                      <button
                        onClick={() => dispatch(toggleFeaturedStatus({ id: r._id, featured: !r.featured }))}
                        disabled={adminActionLoading}
                        title="Toggle featured"
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                          r.featured ? "bg-[#B8863B] text-white" : "bg-[#B8863B]/15 text-[#B8863B] hover:bg-[#B8863B] hover:text-white"
                        }`}
                      >
                        <FiStar />
                      </button>
                      <button
                        onClick={() => dispatch(toggleExclusiveStatus({ id: r._id, exclusive: !r.exclusive }))}
                        disabled={adminActionLoading}
                        title="Toggle exclusive"
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                          r.exclusive ? "bg-[#16281F] text-white" : "bg-[#16281F]/10 text-[#16281F] hover:bg-[#16281F] hover:text-white"
                        }`}
                      >
                        <FiAward />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRestaurants;