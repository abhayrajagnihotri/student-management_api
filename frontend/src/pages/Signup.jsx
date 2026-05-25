import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        navigate("/login");
      }
    } catch (error) {
      alert("Backend connection failed");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSignup} style={styles.card}>
        <h2 style={styles.title}>Signup</h2>

        <label style={styles.label}>Name</label>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} type="submit">
          Signup
        </button>

        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: "360px",
    display: "flex",
    flexDirection: "column",
    padding: "30px",
    borderRadius: "12px",
    background: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  label: {
    marginBottom: "6px",
    fontWeight: "600",
  },
  input: {
    padding: "12px",
    marginBottom: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  text: {
    textAlign: "center",
    marginTop: "16px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Signup;