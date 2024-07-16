const express = require("express");
const passport = require("passport");
const csrfProtection = require("csurf")({ cookie: true });
const userController = require("../src/controllers/userController");
const { authenticateToken } = require("../middlewares/authenticateToken");

const router = express.Router();

// Signup
router.get("/signup", csrfProtection, (req, res) => {
  res.render("signup", { csrfToken: req.csrfToken() });
});

router.post("/signup", csrfProtection, userController.signup);

router.post("/login", csrfProtection, userController.login);

router.get("/me", authenticateToken, userController.getId);

// Logout
router.post("/logout", csrfProtection, userController.logout);

// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  userController.oauthLogin,
);

// Facebook OAuth
router.get("/auth/facebook", passport.authenticate("facebook"));
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  userController.oauthLogin,
);

module.exports = router;
