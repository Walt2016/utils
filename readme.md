
#初始化package.json
npm init -y

#安装shelljs
npm install  shelljs  --save

#安装babel7
npm install --save-dev @babel/core @babel/cli @babel/preset-env

    // "babel":"node ./build/babel.js"
    "babel":"npx babel js  --out-dir dist"


#安装webpack4+
npm install webpack webpack-cli --save-dev

执行
npx webpack --config webpack.config.js
npm run pack


加载 CSS
为了从 JavaScript 模块中 import 一个 CSS 文件，你需要在 module 配置中 安装并添加 style-loader 和 css-loader：
npm install --save-dev style-loader css-loader
加载图片
npm install --save-dev file-loader