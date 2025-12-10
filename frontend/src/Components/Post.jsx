import React, { useState } from "react";
import axios from "axios";
import "./Post.css";

const LostAndFoundForm = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
    status: "Lost",
    images: [],
  });

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...formData.images, ...files];
      const newPreviews = [...previews, ...files.map((file) => URL.createObjectURL(file))];

      setFormData((prev) => ({ ...prev, images: newImages }));
      setPreviews(newPreviews);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setFormData((prev) => ({ ...prev, images: updatedImages }));
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("itemName", formData.itemName);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("location", formData.location);
    data.append("status", formData.status);
    formData.images.forEach((image) => data.append("images", image));

    try {
      const response = await axios.post("https://lost-and-found-system-lf77.onrender.com/api/posts", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem("token"),
        },
      });
      alert("Post added successfully!");
      setFormData({ itemName: "", category: "", description: "", location: "", status: "Lost", images: [] });
      setPreviews([]);
    } catch (error) {
      alert("Failed to submit post. Try again.");
      console.error("Post Submission Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="content mt-4">
      <h2 className="text-center">Lost and Found Item Form</h2>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
        <div className="mb-3">
          <label className="form-label">Status:</label>
          <select className="form-control" name="status" value={formData.status} onChange={handleChange} required>
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
            <option value="Cards">Cards</option>
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
        <div className="mb-3">
          <label className="form-label">Upload Images:</label>
          <input type="file" className="form-control" accept="image/*" multiple onChange={handleImageChange} />
          {previews.length > 0 && (
            <div className="mt-3 d-flex flex-wrap gap-2">
              {previews.map((src, index) => (
                <div key={index} className="image-container position-relative">
                  <img src={src} alt={`Preview ${index + 1}`} className="img-thumbnail" width="100" />
                  <button type="button" className="remove-image" onClick={() => handleRemoveImage(index)}>x</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-100 submitbtn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default LostAndFoundForm;
