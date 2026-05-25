import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = ["avatar-purple", "avatar-blue", "avatar-green", "avatar-pink", "avatar-orange"];

function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Navbar */}
      <nav className="dash-navbar">
        <span className="logo">StudentHub</span>
        <div className="nav-actions">
          <button className="nav-btn" onClick={fetchUsers}>
            ↻ Refresh
          </button>
          <button className="nav-btn" onClick={() => navigate("/login")}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dash-container">
        {/* Header */}
        <div className="dash-header">
          <h1>Dashboard</h1>
          <p>Manage your students and users from one place</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-sub">All registered users</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Showing</div>
            <div className="stat-value">{filtered.length}</div>
            <div className="stat-sub">Filtered results</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize: "22px" }}>
              {loading ? "Loading..." : "Connected"}
            </div>
            <div className="stat-sub">Database status</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="action-cards">
          <div className="action-card create" onClick={() => navigate("/create-user")}>
            <div className="action-icon green">＋</div>
            <h3>Create User</h3>
            <p>Add a new student to the system with name, email and password</p>
          </div>
          <div className="action-card update" onClick={() => navigate("/update-user")}>
            <div className="action-icon yellow">✎</div>
            <h3>Update User</h3>
            <p>Modify existing user details like name, email or password</p>
          </div>
          <div className="action-card delete" onClick={() => navigate("/delete-user")}>
            <div className="action-icon red">✕</div>
            <h3>Delete User</h3>
            <p>Remove a user permanently from the database</p>
          </div>
        </div>

        {/* Search & Table */}
        <div className="search-section">
          <h2>All Users</h2>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="table-wrapper" style={{ padding: "48px", textAlign: "center" }}>
            <div className="stat-value" style={{ fontSize: "18px", marginBottom: "8px" }}>Loading users...</div>
            <p style={{ color: "#64748b" }}>Fetching data from database</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((user, idx) => (
                    <tr key={user.id}>
                      <td>
                        <span className="id-badge">#{user.id}</span>
                      </td>
                      <td>
                        <div className="user-name-cell">
                          <div className={`user-avatar ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td>
                        <span className="email-badge">{user.email}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-edit" onClick={() => navigate("/update-user")}>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => navigate("/delete-user")}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      {search ? `No users found matching "${search}"` : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;