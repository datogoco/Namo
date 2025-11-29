// src/controllers/cartController.js

const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");

exports.getCart = async (req, res) => {
  try {
    if (req.user) {
      console.log("Fetching cart for user:", req.user._id);
      let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.product",
        model: "Product",
      });

      if (!cart) {
        console.log("No cart found for user. Creating new cart...");
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
      } else {
        console.log("Existing cart found for user:", cart);
      }

      res.status(200).json(cart);
    }
  } catch (error) {
    console.error("Error loading cart from database:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// This function is used to render the cart view in ejs
exports.getCartView = async (req, res) => {
  try {
    let cart = { items: [] }; // Default empty cart
    if (req.user) {
      // Fetch cart for authenticated users
      console.log("Fetching cart for user:", req.user._id);
      cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.product",
        model: "Product",
      });

      if (!cart) {
        cart = { items: [] };
      }
    }

    // For unauthenticated users, the frontend will handle loading from localStorage
    res.render("cart", {
      cart: cart.items,
      csrfToken: req.csrfToken(),
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading cart view:", error);
    res.status(500).render("error", { message: "Server error" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    console.log("Add to cart request received:", { productId, quantity });

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user) {
      console.log("User is authenticated:", req.user._id);
      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId,
      );
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();

      console.log("Cart updated:", cart);
      res.status(200).json(cart);
    } else {
      console.log("User is not authenticated, using session cart");
      if (!req.session.cart) {
        req.session.cart = [];
      }

      const existingItemIndex = req.session.cart.findIndex(
        item => item.productId === productId,
      );
      if (existingItemIndex > -1) {
        req.session.cart[existingItemIndex].quantity = quantity;
      } else {
        req.session.cart.push({
          productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
        });
      }

      console.log("Session cart updated:", req.session.cart);
      res.status(200).json({ items: req.session.cart });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("Remove from cart request received:", { productId });

    if (req.user) {
      console.log("User is authenticated:", req.user._id);
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        console.log("Cart not found");
        return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = cart.items.filter(
        item => item.product.toString() !== productId,
      );

      await cart.save();
      console.log("Cart updated:", cart);
      res.status(200).json(cart);
    } else {
      console.log("User is not authenticated, using session cart");
      if (!req.session.cart) {
        console.log("Cart not found in session");
        return res.status(404).json({ message: "Cart not found" });
      }

      req.session.cart = req.session.cart.filter(
        item => item.productId !== productId,
      );

      console.log("Session cart updated:", req.session.cart);
      res.status(200).json({ items: req.session.cart });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    console.log("Update cart request received:", { productId, quantity });

    if (req.user) {
      console.log("User is authenticated:", req.user._id);
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        console.log("Cart not found");
        return res.status(404).json({ message: "Cart not found" });
      }

      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId,
      );
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = quantity;
      } else {
        console.log("Product not found in cart");
        return res.status(404).json({ message: "Product not found in cart" });
      }

      await cart.save();
      console.log("Cart updated:", cart);
      res.status(200).json(cart);
    } else {
      console.log("User is not authenticated, using session cart");
      if (!req.session.cart) {
        console.log("Cart not found in session");
        return res.status(404).json({ message: "Cart not found" });
      }

      const existingItemIndex = req.session.cart.findIndex(
        item => item.productId === productId,
      );
      if (existingItemIndex > -1) {
        req.session.cart[existingItemIndex].quantity = quantity;
      } else {
        console.log("Product not found in session cart");
        return res.status(404).json({ message: "Product not found in cart" });
      }

      console.log("Session cart updated:", req.session.cart);
      res.status(200).json({ items: req.session.cart });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};
