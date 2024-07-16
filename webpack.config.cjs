const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    main: "./public/index.js",
    login: "./public/login.js",
    signup: "./public/signup.js",
    dashboard: "./public/dashboard.js", // Add this line
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "/dist/", // Set the public path for bundled files
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
      publicPath: "/",
      watch: true,
    },
    hot: true,
    port: 8080,
  },
  devtool: "source-map",
};
