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

const productRouter = require("../routes/productRoutes");
const cartRouter = require("../routes/cartRoutes");
const userRouter = require("../routes/userRoutes");
const indexRouter = require("../routes/indexRoutes");
const logger = require("../utils/logger");
const errorController = require("./controllers/errorController");

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

// Initialize express app
const app = express();

// Initialize passport configuration before using it
require("../config/passport-config");

app.use(cors());
app.use(express.json());
app.use(flash());
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
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// CSRF protection middleware should come after session middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware to pass CSRF token to views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get("/get-csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
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
        imgSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com"],
        connectSrc: [
          "'self'",
          "https://127.0.0.1:3000",
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
app.set("io", null);

// Middleware to log each request
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// Use the routes
app.use("/", indexRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/cart", cartRouter);

// Custom route to check authentication
app.get("/api/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
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
