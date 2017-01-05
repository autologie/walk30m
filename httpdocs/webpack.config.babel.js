import webpack from 'webpack';
import path from 'path';
import InlineEnviromentVariablesPlugin from 'inline-environment-variables-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

module.exports = {
  context: path.join(__dirname, 'src/'),
  entry: './js/bootstrap.js',
  resolve: {
    root: __dirname,
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(__dirname, "node_modules"),
    ],
  },
  output: {
    path: path.join(__dirname, '/target'),
    filename: 'js/app.js',
  },
  externals: {
    'window': 'window',
    'google': 'google',
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new InlineEnviromentVariablesPlugin,
    new HtmlWebpackPlugin({
      inject: 'head',
      favicon: 'favicon.ico',
      template: 'index.html',
      minify: {}
    }),
    new CopyWebpackPlugin([
      { from: 'images', to: 'images' },
      { from: 'css', to: 'css' }
    ]),
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: 'target/',
    inline: true,
    port: 8080,
  },
};

