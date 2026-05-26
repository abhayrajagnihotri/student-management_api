import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UpdateUser() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`http://65.2.167.217:8080/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setUserId("");
        setName("");
        setEmail("");
        setPassword("");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(data.message || "Failed to update user");
      }
    } catch (err) {
      setError("Backend connection failed");
    }
  };

  return (
    <div className="crud-page">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="crud-card">
        <div className="crud-icon yellow">✎</div>
        <h2>Update User</h2>
        <p className="crud-desc">
          Enter the user ID to identify them, then update their details.
        </p>

        {success && (
          <div className="success-msg">✓ User updated successfully! Redirecting...</div>
        )}

        {error && (
          <div className="warning-box">
            <span className="warn-icon">⚠</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <hr className="divider-line" />

          <div className="form-group">
            <label>New Name</label>
            <input
              type="text"
              placeholder="Enter new name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Email</label>
            <input
              type="email"
              placeholder="Enter new email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="crud-submit yellow-btn">
            Update User
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateUser;
