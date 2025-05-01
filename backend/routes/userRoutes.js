const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get all users except the requester
router.get("/all/:id", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select(["email", "username", "avatar", "_id"]);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching users", error });
  }
});


// Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select(["email", "username", "avatar", "_id"]);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Error fetching users", error });
  }
});



// Get a specific user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
});
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err });
    }
});
module.exports = router;

