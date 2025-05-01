
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerImages, setViewerImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [showPosts, setShowPosts] = useState(true);
  const navigate = useNavigate();

  // Check if the token is expired
  const isTokenExpired = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
    const expiry = payload.exp * 1000; // Convert expiry to milliseconds
    return expiry < Date.now(); // If token is expired, return true
  };

  // Fetch posts and users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token.split(".").length !== 3) {
      alert("Unauthorized access. Please log in.");
      navigate("/login");
      return;
    }
    
    if (isTokenExpired(token)) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const fetchData = async () => {
      try {
        const [postRes, userRes] = await Promise.all([
          axios.get("http://localhost:5002/api/posts"),
          axios.get("http://localhost:5002/api/users/all"),
        ]);
        setPosts(postRes.data);
        
        const filteredUsers = userRes.data.users.filter(
          (user) => !user.email.includes("@discover") && !user.username.includes("admin")
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchData();
  }, [navigate]);

  const openViewer = (images, index) => {
    setViewerImages(images);
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => setIsViewerOpen(false);
  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % viewerImages.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + viewerImages.length) % viewerImages.length);

  const deletePost = async (id) => {
    const token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5002/api/posts/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is included in request
          },
        }
      );
      console.log("Delete response:", response.data);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      alert("Post deleted successfully!");
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      alert("Failed to delete post.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/users/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Delete User Error:", err);
      alert("Failed to delete user.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    localStorage.setItem("IsAuthenticated", false);
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Admin Panel</h2>

      <button className="admin-logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <div className="admin-toggle-buttons">
        <button
          className={`admin-toggle-btn ${showPosts ? "active" : ""}`}
          onClick={() => setShowPosts(true)}
        >
          View Posts
        </button>
        <button
          className={`admin-toggle-btn ${!showPosts ? "active" : ""}`}
          onClick={() => setShowPosts(false)}
        >
          View Users
        </button>
      </div>

      {loading ? (
        <div className="admin-loader">Loading...</div>
      ) : showPosts ? (
        posts.length ? (
          posts.map((post) => (
            <div key={post._id} className="admin-card">
              <div
                className="admin-image-wrapper"
                onMouseEnter={() => setHoveredPost(post._id)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                <img
                  src={`http://localhost:5002${post.images[0]}`}
                  alt={post.itemName}
                  className="admin-post-image"
                  onClick={() => openViewer(post.images, 0)}
                />
                {hoveredPost === post._id && (
                  <div className="admin-image-count">{post.images.length} Images</div>
                )}
              </div>
              <div className="admin-card-content">
                <h3>{post.itemName}</h3>
                <p><strong>Posted By:</strong> {post.username}</p>
                <p><strong>Category:</strong> {post.category}</p>
                <p><strong>Description:</strong> {post.description}</p>
                <p><strong>Location:</strong> {post.location}</p>
                <p className={`admin-status ${post.status === "Lost" ? "lost" : "found"}`}>
                  <strong>Status:</strong> {post.status}
                </p>
              </div>
              <button className="admin-delete-btn" onClick={() => deletePost(post._id)}>
                <FaTrash /> Delete
              </button>
            </div>
          ))
        ) : (
          <p className="admin-empty-msg">No posts found.</p>
        )
      ) : users.length ? (
        users.map((user) => (
          <div key={user._id} className="admin-card">
            <div className="admin-card-content">
              <h3>{user.username}</h3>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <button className="admin-delete-btn" onClick={() => deleteUser(user._id)}>
              <FaTrash /> Delete
            </button>
          </div>
        ))
      ) : (
        <p className="admin-empty-msg">No users found.</p>
      )}

      {isViewerOpen && (
        <div className="admin-image-viewer">
          <button className="admin-viewer-close" onClick={closeViewer}>X</button>
          <button className="admin-viewer-nav left" onClick={prevImage}>&#10094;</button>
          <img
            src={`http://localhost:5002${viewerImages[currentIndex]}`}
            alt="Preview"
            className="admin-viewer-image"
          />
          <button className="admin-viewer-nav right" onClick={nextImage}>&#10095;</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
