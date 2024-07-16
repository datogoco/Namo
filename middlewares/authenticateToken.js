const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateToken = async (req, res, next) => {
  let token;

  // Check if the token is provided in the Authorization header (for API requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    // Check if the token is provided as a cookie (for traditional web requests)
    token = req.cookies.jwt;
  }

  if (!token) {
    console.log("No token provided.");
    req.user = null; // Proceed as unauthenticated user
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found.");
      req.user = null; // Proceed as unauthenticated user
      return next();
    }
    req.user = user; // Set the user information in the request
    next();
  } catch (err) {
    console.log("Invalid token:", err);
    req.user = null; // Proceed as unauthenticated user
    next();
  }
};

module.exports = { authenticateToken };
