import path from "path";
import InlineEnviromentVariablesPlugin from "inline-environment-variables-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

module.exports = {
  context: path.join(__dirname, "src/"),
  entry: "./js/bootstrap.js",
  output: {
    path: path.join(__dirname, "/target"),
    filename: "js/app.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new InlineEnviromentVariablesPlugin(),
    new HtmlWebpackPlugin({
      inject: "head",
      favicon: "favicon.ico",
      template: "index.html",
      minify: {}
    }),
    new CopyWebpackPlugin([
      { from: "images", to: "images" },
      { from: "css", to: "css" }
    ])
  ],
  optimization: {
    minimize: true
  },
  devServer: {
    contentBase: "target/",
    inline: true,
    port: 8080
  }
};
