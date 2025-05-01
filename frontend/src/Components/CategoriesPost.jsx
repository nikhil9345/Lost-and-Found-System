import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
const CategoryPosts = ({ searchQuery, statusFilter }) => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPost, setHoveredPost] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5002/api/posts", {
          params: { category: category.trim() },
        });

        console.log("Fetched Posts:", response.data);
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching category posts:", error);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  // const filteredPosts = posts.filter(
  //   (post) => post.category.toLowerCase() === category.toLowerCase()
  // );
  const filteredPosts = posts.filter((post) => {
  const matchesCategory = post.category.toLowerCase() === category.toLowerCase();
  
  const matchesSearch = searchQuery
    ? post.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const matchesStatus = statusFilter
    ? post.status.toLowerCase() === statusFilter.toLowerCase()
    : true;

  return matchesCategory && matchesSearch && matchesStatus;
});
  const openViewer = (images, index) => {
    setViewerImages(images);
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : viewerImages.length - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex < viewerImages.length - 1 ? prevIndex + 1 : 0));
  };

  const handleOpenChat = (user) => {
    setSelectedUser(user);
    setChatOpen(true);
  };

  return (
    <div className="category-posts-container">
      <button style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop:"10px",
          border: "none",
          backgroundColor:"transparent",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold"
        }} onClick={() => navigate("/categories")}>
        <FaArrowLeft /> Back
      </button>

      <h2>Posts in {category}</h2>

      {loading ? (
        <div className="loader">Loading...</div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredPosts.length > 0 ? (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <div key={post._id} className="card">
              <div 
                className="image-container"
                onMouseEnter={() => setHoveredPost(post._id)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                <img 
                  src={`http://localhost:5002${post.images[0]}`} 
                  alt={post.itemName} 
                  height={250} 
                  width={250} 
                  onClick={() => openViewer(post.images, 0)}
                  style={{ cursor: "pointer" }}
                />
                {hoveredPost === post._id && (
                  <div className="image-count-overlay">
                    {post.images.length} Images
                  </div>
                )}
              </div>
              <div className="card-content">
                <h3>{post.itemName}</h3>
                <p><strong>Category:</strong> {post.category}</p>
                <p><strong>Description:</strong> {post.description || "No description available."}</p>
                <p><strong>Location:</strong> {post.location}</p>
                <p className={post.status === "Lost" ? "lost-status" : "found-status"}>
                  <strong>Status:</strong> {post.status}
                </p>
              </div>
              <button className="msgbtn" onClick={() => handleOpenChat(post.itemName)}>Message</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts found.</p>
      )}

      {isViewerOpen && (
        <div className="image-viewer-overlay">
          <button className="close-btn" onClick={closeViewer}>X</button>
          <button className="prev" onClick={prevImage}>&#10094;</button>
          <img src={`http://localhost:5002${viewerImages[currentIndex]}`} alt="Preview" className="viewer-image" />
          <button className="next" onClick={nextImage}>&#10095;</button>
        </div>
      )}

      {chatOpen && <ChatBox user={selectedUser} onClose={() => setChatOpen(false)} />}
    </div>
  );
};

export default CategoryPosts;
