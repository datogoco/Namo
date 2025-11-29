const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const session = require("express-session");
const passport = require("passport");
const helmet = require("helmet");
const cors = require("cors");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const productRouter = require("../routes/productRoutes");
const cartRouter = require("../routes/cartRoutes");
const userRouter = require("../routes/userRoutes");
const checkoutRouter = require("../routes/checkoutRoutes");
const paymentRouter = require("../routes/paymentRoutes");
const indexRouter = require("../routes/indexRoutes");
const logger = require("../utils/logger");
const errorController = require("./controllers/errorController");
const User = require("../models/userModel");

// Load env from .env (preferred) and fall back to legacy config.env
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });
dotenv.config({ path: path.resolve(__dirname, "../config.env") });

// Initialize express app
const app = express();

// Request debug logger
app.use((req, res, next) => {
  console.log(
    "[REQ]",
    req.method,
    req.url,
    "protocol=",
    req.protocol,
    "header x-forwarded-proto =",
    req.headers["x-forwarded-proto"],
  );
  next();
});

// Initialize passport configuration before using it
require("../config/passport-config");

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // Serve static assets
app.use("/dist", express.static(path.join(__dirname, "../dist"))); // Serve bundled JS files
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60000 * 60 * 24,
    },
  }),
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// CSRF protection middleware should come after session middleware
const csrfProtection = csrf({ cookie: true });
app.use((req, res, next) => {
  if (req.path === "/api/v1/payment/bog/callback") {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Middleware to pass CSRF token to views
app.use((req, res, next) => {
  if (req.path === "/api/v1/payment/bog/callback") return next();
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get("/get-csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use((req, res, next) => {
  res.locals.errorMessage = req.flash("error");
  next();
});

// Helmet configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
          "https://kit.fontawesome.com",
        ],
        scriptSrcElem: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
          "https://kit.fontawesome.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "https://use.fontawesome.com",
          "https://unpkg.com",
        ],
        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com",
          "https://use.fontawesome.com",
          "https://ka-f.fontawesome.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://cdnjs.cloudflare.com",
          "https://namo-product-images.s3.eu-north-1.amazonaws.com",
        ],
        connectSrc: [
          "'self'",
          backendUrl,
          frontendUrl,
          "https://unpkg.com",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
      reportOnly: false,
    },
  }),
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views")); // Set views directory

// Middleware to log each request
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// HTTPS redirect disabled for debugging
console.log("[DEBUG] HTTPS redirect middleware is DISABLED");

// Use the routes
app.use("/", indexRouter);
app.use("/", userRouter);
app.use("/", checkoutRouter);
app.use("/api/v1/payment", paymentRouter);
app.use(cartRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/cart", cartRouter);

// Custom route to check authentication
app.get("/api/check-auth", async (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ isAuthenticated: true });
  }

  const token = req.cookies.jwt;
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return res.json({ isAuthenticated: true });
    }
  } catch (err) {
    logger.warn(`JWT check-auth verification failed: ${err.message}`);
  }

  res.json({ isAuthenticated: false });
});

// Logout route
app.post("/logout", csrfProtection, (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie("jwt");
    res.redirect("/login");
  });
});

// Handle 404 errors
app.all("*", (req, res, next) => {
  res.status(404).send("Page not found");
});

// Global error handler
app.use(errorController);

module.exports = app;
