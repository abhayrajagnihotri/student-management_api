import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DeleteUser() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setUserId("");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(data.message || "Failed to delete user");
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
        <div className="crud-icon red">✕</div>
        <h2>Delete User</h2>
        <p className="crud-desc">
          Enter the user ID or email to permanently remove them from the system.
        </p>

        {success && (
          <div className="success-msg">✓ User deleted successfully! Redirecting...</div>
        )}

        {error && (
          <div className="warning-box">
            <span className="warn-icon">⚠</span>
            <p>{error}</p>
          </div>
        )}

        <div className="warning-box">
          <span className="warn-icon">⚠</span>
          <p>
            <strong>Warning:</strong> This action is permanent and cannot be undone.
            The user and all associated data will be permanently removed from the database.
            Please make sure you have the correct user ID or email before proceeding.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User ID or Email</label>
            <input
              type="text"
              placeholder="Enter user ID or email address"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="crud-submit red-btn">
            Delete User
          </button>
        </form>
      </div>
    </div>
  );
}

export default DeleteUser;
