const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model
const JWT_SECRET = "your_secret_key"; // Change this in production

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");
    console.log("Received token:", token); // Debugging the token

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const decoded = jwt.verify(actualToken, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user; // Attach user object to request
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
