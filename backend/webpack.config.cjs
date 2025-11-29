const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    main: "./public/index.js",
    login: "./public/login.js",
    signup: "./public/signup.js",
    dashboard: "./public/dashboard.js",
    cartItem: "./public/cartItem.js",
    cartPage: "./public/cartPage.js",
    checkout: "./public/checkout.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "/dist/", // your bundles will be served from /dist/
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
    ],
  },
  devServer: {
    static: [
      path.resolve(__dirname), // <-- serve project root (so /index.html works)
      path.resolve(__dirname, "public"), // <-- serve /styles.css, /img, etc.
    ],
    historyApiFallback: { index: "/index.html" }, // open / and it serves index.html
    hot: true,
    port: 8080,
  },
  devtool: "source-map",
};
