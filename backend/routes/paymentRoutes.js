const express = require("express");
const bogPaymentController = require("../src/controllers/bogPaymentController");

const router = express.Router();

router.post("/bog/create", bogPaymentController.createBogOrder);
router.post("/bog/callback", bogPaymentController.bogCallback);

module.exports = router;
