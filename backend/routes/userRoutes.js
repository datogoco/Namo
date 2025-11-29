const express = require("express");
const passport = require("passport");
const csrfProtection = require("csurf")({ cookie: true });
const userController = require("../src/controllers/userController");
const { authenticateToken } = require("../middlewares/authenticateToken");
const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated");

const router = express.Router();

// Signup
router.get("/signup", csrfProtection, (req, res) => {
  res.render("signup", {
    csrfToken: req.csrfToken(),
    form: {},
    error: null,
  });
});

router.post("/signup", csrfProtection, userController.signup);

// Updated login route with flash message handling
router.get("/login", redirectIfAuthenticated, csrfProtection, (req, res) => {
  res.render("login", {
    csrfToken: req.csrfToken(), // Pass CSRF token only, no need to pass errorMessage
  });
});

router.post("/login", csrfProtection, userController.login);

router.get("/me", authenticateToken, userController.getId);

// Logout
router.post("/logout", csrfProtection, userController.logout);

// Authenticated route for /dashboard
router.get("/dashboard", authenticateToken, csrfProtection, (req, res) => {
  const currentDate = new Date();

  const options = { month: "short", day: "2-digit", year: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  const { user } = req;
  res.render("dashboard", {
    user,
    currentDate: formattedDate,
    csrfToken: req.csrfToken(),
  });
});

// Google OAuth
router.get(
  "/auth/google",
  (req, res, next) => {
    console.log("[GOOGLE] Building OAuth request...");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("[GOOGLE] Entering /auth/google/callback route");
    console.log("[GOOGLE] Callback received at /auth/google/callback");
    next();
  },
  passport.authenticate("google", { failureRedirect: "/login" }),
  userController.oauthLogin,
);

// Google fallback
router.get("/auth/google/*", (req, res) => {
  console.log("[GOOGLE] Unknown Google route:", req.originalUrl);
  res.status(404).send("Google route not found");
});

// Facebook OAuth
router.get("/auth/facebook", passport.authenticate("facebook"));
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  userController.oauthLogin,
);

// LinkedIn OAuth
router.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_emailaddress", "r_liteprofile"],
  }),
);
router.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/login" }),
  userController.oauthLogin,
);

module.exports = router;
