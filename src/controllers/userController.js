const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModel");
const logger = require("../../utils/logger");

console.log("userController.js loaded");

exports.signup = async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    const newUser = new User({
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      name: req.body.name,
    });
    await newUser.save();
    logger.info(`New user registered: ${newUser.email}`);
    res.status(201).send("User created");
  } catch (error) {
    logger.error(`User registration failed: ${error.message}`);
    console.log("User registration failed:", error);
    res.status(500).send("Error in registration");
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ status: "fail", message: info.message });

    req.logIn(user, async loginErr => {
      if (loginErr) return next(loginErr);

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const cookieOptions = {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production", // Use 'true' for production
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Adjust for local development
      };

      res.cookie("jwt", token, cookieOptions);

      // Transfer session cart items to user cart in the database
      if (req.session.cart && req.session.cart.length > 0) {
        const userCart =
          (await Cart.findOne({ user: user._id })) ||
          new Cart({ user: user._id, items: [] });
        req.session.cart.forEach(item => {
          const existingItemIndex = userCart.items.findIndex(
            cartItem => cartItem.product.toString() === item.productId,
          );
          if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += item.quantity;
          } else {
            userCart.items.push({
              product: item.productId,
              quantity: item.quantity,
            });
          }
        });
        await userCart.save();
        req.session.cart = []; // Clear session cart after transfer
      }

      return res.redirect("/dashboard");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  req.logout(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    res.status(200).json({ status: "success", message: "Logged out" });
  });
};

exports.getId = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.oauthLogin = (req, res) => {
  console.log("OAuth login function called");
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("jwt", token, cookieOptions);
  res.redirect("/");
};
