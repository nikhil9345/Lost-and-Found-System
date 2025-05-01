const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ["Lost", "Found"], required: true },
  images: { type: [String], default: [] }, // Store image URLs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);


