const express = require("express");
const csrfProtection = require("csurf")({ cookie: true });

const router = express.Router();

// Public routes
router.get("/", csrfProtection, (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

module.exports = router;
