import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

const roleColors = {
  user: "bg-[#5C5C54]/15 text-[#5C5C54]",
  owner: "bg-[#3F6B4F]/15 text-[#3F6B4F]",
  admin: "bg-[#B8863B]/15 text-[#B8863B]",
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await axiosInstance.get("/admin/users", { params });
      setUsers(res.data.data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleToggleBan = async (user) => {
    setActionLoadingId(user._id);
    try {
      await axiosInstance.patch(`/admin/users/${user._id}/ban`, { banned: !user.isBanned });
      toast.success(user.isBanned ? "User unbanned" : "User banned");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    setActionLoadingId(id);
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-[#FDFBF6] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-5 py-12">
        <h1
          className="text-[32px] text-[#16281F] mb-8"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Manage users
        </h1>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#E7E2D6] text-[14px] text-[#16281F] focus:outline-none focus:ring-2 focus:ring-[#B8863B]/40"
          >
            <option value="">All roles</option>
            <option value="user">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <p className="text-[#B0AA9C] text-center py-16">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-[#B0AA9C] text-center py-16">No users found</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white border border-[#E7E2D6] rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] text-[#16281F] font-medium truncate">{u.name}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                    {u.isBanned && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#A63D2F]/15 text-[#A63D2F] shrink-0">
                        Banned
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#5C5C54] truncate">{u.email} · {u.phone}</p>
                </div>

                {u.role !== "admin" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleBan(u)}
                      disabled={actionLoadingId === u._id}
                      className={`text-[12px] font-medium px-3.5 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                        u.isBanned
                          ? "bg-[#3F6B4F]/15 text-[#3F6B4F] hover:bg-[#3F6B4F] hover:text-white"
                          : "bg-[#B8863B]/15 text-[#B8863B] hover:bg-[#B8863B] hover:text-white"
                      }`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      disabled={actionLoadingId === u._id}
                      className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-[#A63D2F]/15 text-[#A63D2F] hover:bg-[#A63D2F] hover:text-white transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;