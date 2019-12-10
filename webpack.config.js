let express = require("express");
let path = require("path");
let HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    module:{
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, "dist"),
//    open: true,
        port: 9000,
        before: function(app, server) {
            app.use("/api", express.static(path.join(__dirname, "data")));
        }
    }
};
