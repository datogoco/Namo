const express = require("express");
const { authenticateToken } = require("../middlewares/authenticateToken");
const cartController = require("../src/controllers/cartController");

const router = express.Router();

router.get("/", authenticateToken, cartController.getCart);
router.post("/add", authenticateToken, cartController.addToCart);
router.post("/remove", authenticateToken, cartController.removeFromCart);
router.post("/update", authenticateToken, cartController.updateCart);

module.exports = router;
