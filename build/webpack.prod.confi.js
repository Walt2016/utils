const path = require("path")
module.exports={
    mode: "production",
    // devtool: 'eval-source-map',
    entry: path.resolve(__dirname, "../utils.js"), //唯一的入口文件
    output: {
        path: path.resolve(__dirname, "../dist"), //打包后的文件存放的地方
        filename: "bundle.js" //打包后输出文件的文件名
    },
}