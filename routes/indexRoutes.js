const express = require("express");
const passport = require("passport");
const csrfProtection = require("csurf")({ cookie: true });
const { authenticateToken } = require("../middlewares/authenticateToken");

const router = express.Router();

// Public routes
router.get("/", csrfProtection, (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

router.get("/login", csrfProtection, (req, res) => {
  res.render("login", { csrfToken: req.csrfToken() });
});

router.post(
  "/login",
  csrfProtection,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

// Authenticated routes
router.get("/dashboard", authenticateToken, csrfProtection, (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  const { user } = req;
  res.render("dashboard", { user: user, csrfToken: req.csrfToken() });
});

module.exports = router;
