
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


npm install --save-dev style-loader css-loader