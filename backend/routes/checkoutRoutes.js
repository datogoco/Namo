const express = require("express");
const checkoutController = require("../src/controllers/checkoutController");

const router = express.Router();

router.get("/checkout", checkoutController.renderCheckoutPage);

module.exports = router;
