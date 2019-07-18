const path = require("path")
module.exports = {
    mode: "production",
    // devtool: 'eval-source-map',
    entry: path.resolve(__dirname, "./src/app/index.js"), //唯一的入口文件
    output: {
        path: path.resolve(__dirname, "./dist"), //打包后的文件存放的地方
        filename: "bundle.js" //打包后输出文件的文件名
    },
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
            }

        ]
    }
}