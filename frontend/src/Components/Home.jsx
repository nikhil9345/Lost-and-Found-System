import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import ChatBox from "./Chatbox";
import { useNavigate } from "react-router-dom";

const Home = ({ searchQuery, statusFilter }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewerImages, setViewerImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hoveredPost, setHoveredPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5002/api/posts", {
          params: {
            status: statusFilter || undefined,
            search: searchQuery || undefined,
          },
        });
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []); //  Add statusFilter as dependency

  const handleOpenChat = (userId) => {
    navigate(`/chat/${userId}`); // Redirect to chat page with user ID
  };

  const openViewer = (images, index) => {
    setViewerImages(images);
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % viewerImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + viewerImages.length) % viewerImages.length);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter ? post.status.toLowerCase() === statusFilter.toLowerCase() : true;

    return matchesSearch && matchesStatus;
  });

  // Sort posts by createdAt (newest first)
  const sortedPosts = filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="home-container">
      {loading ? (
        <div className="loader">Loading...</div>
      ) : sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
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
              <p><strong>Description:</strong> {post.description}</p>
              <p><strong>Location:</strong> {post.location}</p>
              <p className={post.status === "Lost" ? "lost-status" : "found-status"}>
                <strong>Status:</strong> {post.status}
              </p>
            </div>
            <button className="msgbtn" onClick={() => handleOpenChat(post.userId)}>Message</button>
          </div>
        ))
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

export default Home;
