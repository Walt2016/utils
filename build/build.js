var webpack=require("webpack")
var config=require("./webpack.prod.confi.js")

webpack(config,(err, stats)=>{
    console.log(err, stats)
})