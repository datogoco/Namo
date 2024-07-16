/* eslint-disable no-console */
const fs = require("fs");
const https = require("https");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const socketIo = require("socket.io");
const app = require("./app");
const logger = require("../utils/logger");

dotenv.config({ path: path.resolve(__dirname, "../config.env") });

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

    // Start the HTTPS server
    const PORT = process.env.PORT || 3000;
    const httpsOptions = {
      key: fs.readFileSync(path.resolve(__dirname, "../config/ssl/server.key")),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../config/ssl/server.crt"),
      ),
    };

    const server = https.createServer(httpsOptions, app);

    // Set up Socket.IO
    const io = socketIo(server);

    io.on("connection", socket => {
      console.log("A user connected");

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    // Make io accessible globally
    app.set("io", io);

    server.listen(PORT, () => {
      logger.info(`Server running on https://127.0.0.1:${PORT}`);
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
