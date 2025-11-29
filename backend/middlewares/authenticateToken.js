const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateToken = async (req, res, next) => {
  // Retrieve token from cookies
  const token = req.cookies.jwt;
  console.log("Token found in cookies:", token);

  if (!token) {
    console.log("No token provided. Redirecting to /login.");
    req.user = null;
    return res.redirect("/login"); // Redirect to login if not authenticated
  }

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    // Find the user by the decoded ID from the JWT
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found for decoded JWT ID:", decoded.id);
      req.user = null;
      return res.redirect("/login"); // Redirect to login if user not found
    }

    console.log("User authenticated:", user.email);
    req.user = user; // Set the user information in the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.log("Error verifying token:", err.message);
    req.logout(logoutError => {
      if (logoutError) {
        console.error("Error during logout:", logoutError);
        return next(logoutError);
      }
      console.log("User logged out due to invalid token.");
      res.clearCookie("jwt");
      return res.redirect("/login");
    });
  }
};

module.exports = { authenticateToken };
