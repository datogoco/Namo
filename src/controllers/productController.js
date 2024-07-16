const Product = require("../../models/productModel");
const logger = require("../../utils/logger");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    logger.error(`Error getting products: ${err.message}`);
    res.status(500).json({
      status: "error",
      message: "Error fetching products",
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      status: "success",
      data: { product: newProduct },
    });
  } catch (err) {
    logger.error(`Error creating product: ${err.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

exports.calculatePrice = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedPrice = product.price * quantity;
    if (!product || typeof product.price !== "number") {
      return res
        .status(404)
        .json({ message: "Product not found or price is undefined" });
    }

    res.json({ updatedPrice: updatedPrice.toFixed(2) });
  } catch (err) {
    console.error("Error in calculatePrice:", err);
    res.status(500).json({
      status: "error",
      message: "Error calculating price",
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ data: { product } });
  } catch (error) {
    logger.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
