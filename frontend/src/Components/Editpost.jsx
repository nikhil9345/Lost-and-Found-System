import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Post.css";

const EditPost = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
    status: "",
    existingImages: [],
    newImages: [],
  });

  const [newPreviews, setNewPreviews] = useState([]);
  const postId = localStorage.getItem("editPostId");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5002/api/posts/${postId}`, {
          headers: { Authorization: token },
        });

        const data = response.data;
        setPost(data);
        setFormData({
          itemName: data.itemName,
          category: data.category,
          description: data.description,
          location: data.location,
          status: data.status,
          existingImages: data.images || [],
          newImages: [],
        });
      } catch (error) {
        console.error("❌ Fetch Error:", error);
      }
    };

    if (postId) fetchPost();
    else console.error("❌ No Post ID in localStorage!");
  }, [postId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, newImages: files }));
    setNewPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const submissionData = new FormData();

    submissionData.append("itemName", formData.itemName);
    submissionData.append("category", formData.category);
    submissionData.append("description", formData.description);
    submissionData.append("location", formData.location);
    submissionData.append("status", formData.status);
    submissionData.append("existingImages", JSON.stringify(formData.existingImages));

    formData.newImages.forEach((img) => {
      submissionData.append("images", img);
    });

    try {
      const response = await axios.put(`http://localhost:5002/api/posts/${postId}`, submissionData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });

      alert("Post updated successfully!");
      localStorage.removeItem("editPostId"); // ✅ Remove post ID
      navigate("/profile"); // ✅ Redirect to profile
    } catch (error) {
      console.error("❌ Update Error:", error);
      alert("Failed to update post.");
    }
  };

  if (!post) return <p>Loading post...</p>;

  return (
    <div className="content mt-4">
      <h2 className="text-center">Edit Lost or Found Post</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
        <div className="mb-3">
          <label className="form-label">Status:</label>
          <select className="form-control" name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Item Name:</label>
          <input type="text" className="form-control" name="itemName" value={formData.itemName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Category:</label>
          <select className="form-control" name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Location Found/Lost:</label>
          <textarea className="form-control" name="location" rows="2" value={formData.location} onChange={handleChange} required></textarea>
        </div>

        {/* Existing Images */}
        {formData.existingImages.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Existing Images:</label>
            <div className="d-flex flex-wrap gap-2">
              {formData.existingImages.map((img, index) => (
                <div key={index} className="image-container position-relative">
                  <img src={`http://localhost:5002${img}`} alt={`Existing ${index}`} className="img-thumbnail" width="100" />
                  <button type="button" className="remove-image" onClick={() => handleRemoveExistingImage(index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div className="mb-3">
          <label className="form-label">Upload New Images:</label>
          <input type="file" className="form-control" accept="image/*" multiple onChange={handleImageChange} />
          {newPreviews.length > 0 && (
            <div className="mt-3 d-flex flex-wrap gap-2">
              {newPreviews.map((src, index) => (
                <div key={index} className="image-container position-relative">
                  <img src={src} alt={`New ${index + 1}`} className="img-thumbnail" width="100" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100 submitbtn">Update Post</button>
      </form>
    </div>
  );
};

export default EditPost;
