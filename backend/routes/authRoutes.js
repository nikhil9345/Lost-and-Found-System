
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ 
            username, 
            email, 
            phone, 
            password: hashedPassword 
        });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                avatar: newUser.avatar
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Get Logged-in User Profile (Protected Route)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});






// Route to update profile details
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, avatar } = req.body;

    // Ensure that user has valid data
    if (!username || !email || !phone) {
      return res.status(400).json({ message: 'Username, email, and phone are required.' });
    }

    // Find user by the token's user ID (added by authMiddleware)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields
    user.username = username;
    user.email = email;
    user.phone = phone;

    if (avatar) {
      user.avatar = avatar;  // Update the avatar if provided
    }

    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) return res.status(400).json({ error: "Email is required" });
  
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "No user found with that email" });
  
      // Create a JWT reset token
      const resetToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: "15m" }
      );
  
      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
  
      // Send reset email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        text: `Hello ${user.username},\n\nClick the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 15 minutes.`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send error:", error);
          return res.status(500).json({ error: "Failed to send reset email" });
        }
        res.status(200).json({ message: "Password reset email sent" });
      });
  
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({ error: "Server error. Try again later." });
    }
  });

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      if (!newPassword) return res.status(400).json({ error: "New password is required" });
  
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password has been successfully reset" });
    } catch (error) {
      console.error("Reset Password Error:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ error: "Token has expired. Please request a new reset link." });
      }
      res.status(400).json({ error: "Invalid token or request." });
    }
  });


module.exports = router;