const express = require("express");
const csrf = require("csurf");
const apiService = require("../src/services/apiService");
const productController = require("../src/controllers/productController");
const { authenticateToken } = require("../middlewares/authenticateToken");

const csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);

router.get("/products", async (req, res) => {
  try {
    const products = await apiService.getProducts();
    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post(
  "/calculate-price",
  authenticateToken,
  csrfProtection, // Ensure CSRF protection middleware is used
  productController.calculatePrice,
);

router.get("/:productId", productController.getProductById);

module.exports = router;
