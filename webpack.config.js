const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    mode: "production",
    // devtool: 'eval-source-map',
    // entry: path.resolve(__dirname, "./src/app/index.js"), //唯一的入口文件
    entry: {
        app: './src/app/index.js',
        print: './src/app/print.js',
        vue: './src/app/App.vue'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, "./dist"), //打包后的文件存放的地方
    },
    plugins: [
        // new CleanWebpackPlugin(['dist']),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/app/index.html',
            // BASE_URL:'http://localhost',
            title: 'Output Management',
            meta: [{
                name: 'description',
                content: 'A better default template for html-webpack-plugin.'
            }],
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin()
    ],
    module: {
        rules: [{
                test: /\.css$/,
                use: [
                    'style-loader', 'css-loader'
                ]
            }, {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.xml$/,
                use: [
                    'xml-loader'
                ]
            },
            {
                test: /\.vue$/,
                use: [
                    'vue-loader'
                ]
            }

        ]
    },
    devServer: {
        contentBase: './dist',
        hot: true
    },
    resolve: {
        alias: {
          'vue$': 'vue/dist/vue.esm.js' // 用 webpack 1 时需用 'vue/dist/vue.common.js'
        }
      }
}