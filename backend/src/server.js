/* eslint-disable no-console */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const app = require("./app");
const logger = require("../utils/logger");

// Load env from .env (preferred) and fall back to legacy config.env for compatibility
const envPath = fs => {
  const envFile = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envFile)) return envFile;
  return path.resolve(__dirname, "../config.env");
};

dotenv.config({ path: envPath(require("fs")) });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    tls: true,
    tlsAllowInvalidCertificates: false,
  })
  .then(() => {
    logger.info("DB connection successful!");

    app.set("trust proxy", 1);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => console.error("DB connection error:", err));

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", err => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});
