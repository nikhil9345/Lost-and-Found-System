import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";  
import "./Login.css";
import logo from "./img/logo final.png";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:5002/api/auth/login", {
        email,
        password,
      });
  
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("id",response.data.user.id)
        localStorage.setItem("token", response.data.token);
        console.log("Token stored:", localStorage.getItem("token"));
        setIsAuthenticated(true);
        localStorage.setItem("IsAuthenticated", true);
        alert("Login successful!");
        if (email.includes('@discover')) {
          // Optionally, verify if this email exists in the admin database
          const adminCheckResponse = await axios.get(`http://localhost:5002/api/users/${localStorage.getItem("id")}`);
          
          if (adminCheckResponse.status === 200) {
            // Redirect to admin page if admin check passes
            navigate("/admin");
          } else {
            alert("Admin not found in the database.");
          }
        } else {
          // Redirect to the home page for regular users
          navigate("/home");
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Try again.");
      console.error("Login Error:", error.response?.data ||error);
    }
  };
  

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" />
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/">Sign up</Link>
        </p>
        <p className="forgot-password">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;