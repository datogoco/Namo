const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModel");
const logger = require("../../utils/logger");

console.log("userController.js loaded");

const signToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  console.log("Generated JWT:", token);
  return token;
};

exports.signup = async (req, res) => {
  try {
    console.log("Register request received:", req.body);

    const newUser = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
    });

    await newUser.save();

    req.login(newUser, err => {
      if (err) {
        console.log("Error during login after signup:", err);
        return res.status(500).render("signup", {
          csrfToken: req.csrfToken(),
          error: "Unexpected error logging in after signup. Please try again.",
          form: { name: req.body.name, email: req.body.email },
        });
      }

      // Generate JWT token for the user
      const token = signToken(newUser._id);

      res.cookie("jwt", token, {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      logger.info(`New user registered and logged in: ${newUser.email}`);

      // PRG pattern: redirect after successful POST
      return res.redirect(303, "/dashboard");
    });
  } catch (error) {
    logger.error(`User registration failed: ${error.message}`);
    console.log("User registration failed:", error);

    // Friendly validation error
    if (error.name === "ValidationError") {
      return res.status(400).render("signup", {
        csrfToken: req.csrfToken(),
        error: error.message,
        form: { name: req.body.name, email: req.body.email },
      });
    }

    // Duplicate email (Mongo duplicate key)
    if (error.code === 11000) {
      return res.status(409).render("signup", {
        csrfToken: req.csrfToken(),
        error: "This email is already registered.",
        form: { name: req.body.name, email: req.body.email },
      });
    }

    return res.status(500).render("signup", {
      csrfToken: req.csrfToken(),
      error: "Something went wrong. Please try again.",
      form: { name: req.body.name, email: req.body.email },
    });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      console.log("Authentication Error:", err);
      return next(err); // Handle error in middleware
    }

    console.log("Authentication Info:", info);

    // If user authentication fails, pass the error message to the view
    if (!user) {
      return res.status(401).json({ status: "fail", message: info.message });
    }

    req.logIn(user, async loginErr => {
      if (loginErr) {
        console.log("Login Error:", loginErr);
        return next(loginErr); // Handle error in middleware
      }

      // Sign the JWT token
      const token = signToken(user._id);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      };

      res.cookie("jwt", token, cookieOptions);

      // Transfer session cart items to the user cart in the database
      try {
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
      } catch (error) {
        console.error("Error transferring session cart:", error);
      }

      return res
        .status(200)
        .json({ status: "success", message: "Logged in successfully" });
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
    res.redirect("/");
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
  const token = signToken(req.user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  const frontendBase = process.env.FRONTEND_BASE_URL || "/";

  res.cookie("jwt", token, cookieOptions);
  res.redirect(frontendBase);
};
