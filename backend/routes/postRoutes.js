



const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/Post");

const router = express.Router();

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });


// Create a new post
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { itemName, category, description, location, status } = req.body;
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const newPost = new Post({
      userId: req.user._id,
      itemName,
      category,
      description,
      location,
      status,
      images: imageUrls,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Post Creation Error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get posts for a specific user
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Update a post
router.put("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, description, location, status, existingImages } = req.body;

    // Find the post and check ownership
    const post = await Post.findOne({ _id: id, userId: req.user._id });
    if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });

    // Handle images
    let updatedImages = [];
    try {
      updatedImages = existingImages ? JSON.parse(existingImages) : [];
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid existingImages format" });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updatedImages = updatedImages.concat(newImages);
    }

    // Perform the update
    const updatedPost = await Post.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { itemName, category, description, location, status, images: updatedImages },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});





router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("❌ Get Post Error:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});





// Delete a post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, userId: req.user._id });
    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    // Remove images from the server
    post.images.forEach((img) => {
      const filePath = path.join(__dirname, "..", img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Post.findOneAndDelete({ _id: id, userId: req.user._id });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});


// Get posts with optional filters (search, status, category)
router.get("/", async (req, res) => {
  try {
    const { search, status, category } = req.query;
    let query = {};

    // 🔍 Search Query (itemName, category, location, description)
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category Filter
    if (category) {
      query.category = { $regex: category.trim(), $options: "i" }; // Exact match for category
    }

    // Status Filter (Lost/Found)
    if (status) {
      query.status = { $regex: new RegExp(`^${status}$`, "i") };
    }

    console.log("Fetching posts with query:", query); //  Debugging query
    const posts = await Post.find(query);
    console.log("Posts found:", posts.length); //  Log results

    res.json(posts);
  } catch (error) {
    console.error(" Backend Error:", error.message, error.stack);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});





// DELETE route for admin to delete a post
router.delete("/admin/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Admin delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;