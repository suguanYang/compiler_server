const path = require("path");
// const ManifestPlugin = require("webpack-manifest-plugin");
const DEV = process.env.NODE_ENV !== "production";

module.exports = {
  mode: DEV ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  },
  context: __dirname,
  entry: path.resolve(__dirname, "./index.js"),
  output: {
    path: "/public/webpack",
    publicPath: "http://localhost:63352/",
    filename: DEV ? "[name].js" : "[name].[contenthash].js",
  },
  // plugins: [
  //   new ManifestPlugin({
  //     fileName: "manifest-fe-manifest.json",
  //     publicPath: path.resolve(__dirname, "./dist"),
  //     writeToFileEmit: true,
  //   }),
  // ],
};
