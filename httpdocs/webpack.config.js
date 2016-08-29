var webpack = require('webpack');
var path = require('path');

module.exports = {
	context: path.join(__dirname, 'src/'),
	entry: './resources/js/bootstrap.js',
	resolve: {
		root: __dirname
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
	module: { loaders: [ ] },
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				drop_debugger: false
			}
		}),
		new webpack.DefinePlugin({
			PUBLIC_API_URL_BASE: JSON.stringify(process.env.PUBLIC_API_URL_BASE)
		})
	],
	devtool: 'source-map'
};

