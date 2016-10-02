var webpack = require('webpack');
var path = require('path');
var InlineEnviromentVariablesPlugin = require('inline-environment-variables-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	context: path.join(__dirname, 'src/'),
	entry: './js/index.js',
	resolve: {
		root: __dirname,
		extensions: ['.js', '.jsx', '']
	},
	resolveLoader: {
		modulesDirectories: [
			path.join(__dirname, "node_modules")
		]
	},
	output: {
		path: path.join(__dirname, '/target'),
		filename: 'js/app.js',
    publicPath: '/'
	},
	externals: {
		'window': 'window',
		'google': 'google'
	},
	module: {
		loaders: [
			{ test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.css$/, exclude: /node_modules/, loaders: ['style', 'css?modules'] },
			{ test: /\.yml?$/, exclude: /node_modules/, loader: 'yaml' }
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin,
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
    ])
	],
	devtool: 'source-map',
  devServer: {
    contentBase: 'target/',
    inline: true,
    port: 8080,
    historyApiFallback: true
  }
};

