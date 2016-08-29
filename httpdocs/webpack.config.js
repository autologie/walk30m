var webpack = require('webpack');
var path = require('path');
var InlineEnviromentVariablesPlugin = require('inline-environment-variables-webpack-plugin');

module.exports = {
	context: path.join(__dirname, 'src/'),
	entry: './resources/js/bootstrap.js',
	resolve: {
		root: __dirname
	},
	resolveLoader: {
		modulesDirectories: [
			path.join(__dirname, "node_modules")
		]
	},
	output: {
		filename: 'app.js',
		path: path.join(__dirname, '/target/resources/js'),
		publicPath: '/resources/js/'
	},
	externals: {
		'window': 'window',
		'google': 'google'
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: "babel" }
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				drop_debugger: false
			}
		}),
    new InlineEnviromentVariablesPlugin()
	],
	devtool: 'source-map'
};

