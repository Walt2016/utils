
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

加载本地数据
npm install --save-dev csv-loader xml-loader
npm WARN csv-loader@3.0.2 requires a peer of papaparse@^4.5.0 but none is installed. You must install peer dependencies yourself.
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@1.2.9 (node_modules\fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@1.2.9: wanted {"os":"darwin","arch":"any"} (current: {"os":"win32","arch":"x64"})



//向 HTML 动态添加 bundle
npm install --save-dev html-webpack-plugin

清理dist文件
npm install clean-webpack-plugin --save-dev

//web 服务器
npm install --save-dev webpack-dev-server


#vue

npm install vue  --save
npm install  vue-loader --save
npm install vue-template-compiler -D