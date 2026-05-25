import { useEffect, useState } from "react";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Student Dashboard</h1>
      <p>Users from PostgreSQL database</p>

      {loading ? (
        <h3>Loading users...</h3>
      ) : (
        <table border="1" cellPadding="12" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <button onClick={fetchUsers} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Refresh Users
      </button>
    </div>
  );
}

export default Dashboard;