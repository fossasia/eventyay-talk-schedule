const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin')

const currentYear = new Date().getFullYear()

module.exports = {
	transpileDependencies: ['buntpapier'],
	configureWebpack: {
		resolve: {
			symlinks: false, // don't flatten symlinks (for npm link)
			modules: [path.resolve('src'), path.resolve('src/styles'), 'node_modules']
		},
		plugins: [
			new HtmlWebpackPlugin({
				// We remove `filename` option to avoid "Conflict: Multiple assets emit different content to the same filename"
				minify: false,
				inject: 'head',
				template: 'public/demo.html'
			}),
			new MomentLocalesPlugin({ // 'en' is a part of moment and cannot be removed
				localesToKeep: ['en-ie', 'ar', 'cs', 'de', 'el', 'es', 'fr', 'it', 'zh-tw', 'ja', 'pt-br'],
			}),
			new MomentTimezoneDataPlugin({
				startYear: currentYear - 5,
				endYear: currentYear + 5,
			}),
		]
	},
	chainWebpack (config) {
		if (config.plugins.has('optimize-css')) {
			config.plugin('optimize-css').tap(([options]) => {
				options.cssnanoOptions.preset[1].calc = false
				return [options]
			})
		}
	},
	css: {
		loaderOptions: {
			stylus: {
				use: [require('buntpapier/stylus')({implicit: false})],
				import: ['~buntpapier/buntpapier/index.styl', '~variables']
			}
		}
	},
	lintOnSave: true,
	productionSourceMap: false
}

if (process.env.ANALYZE) {
	console.log('building with bundle analyzer')
	module.exports.configureWebpack.plugins.push(new BundleAnalyzerPlugin({analyzerMode: 'static'}))
}
