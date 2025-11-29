const express = require("express");
const csrf = require("csurf");
const { authenticateToken } = require("../middlewares/authenticateToken");
const cartController = require("../src/controllers/cartController");

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

// Route for rendering the cart page (EJS view)
router.get("/cart", csrfProtection, cartController.getCartView);

// API route for fetching the cart data (JSON)
router.get("/api/v1/cart", authenticateToken, cartController.getCart);

// Additional routes (add, remove, update cart items)
router.post("/cart/add", authenticateToken, cartController.addToCart);
router.post("/cart/remove", authenticateToken, cartController.removeFromCart);
router.post("/cart/update", authenticateToken, cartController.updateCart);

module.exports = router;
