const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const DIST_PATH = path.resolve(__dirname, "dist");

module.exports = [{
    entry: {
        popup: "./src/popup.js",
        sidebar: "./src/sidebar.js"
    },

    output: {
        clean: true,
        path: DIST_PATH,
        filename: "[name].js",
        assetModuleFilename: "[path][base]"
    },

    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            ["@babel/preset-react", {"runtime": "automatic"}]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.png$/,
                include: [path.resolve(__dirname, "res")],
                type: "asset/resource",
                generator: {
                    filename: "[path][base]"
                }
            }
        ]
    },

    plugins: [
        new HTMLWebpackPlugin({
            title: "Bunny Hole",
            filename: "./popup.html",
            template: "./src/popup.html",
            chunks: [ "popup" ]
        }),
        new HTMLWebpackPlugin({
            title: "Bunny Hole",
            filename: "./sidebar.html",
            template: "./src/sidebar.html",
            chunks: [ "sidebar" ]
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "res/icons/", to: "res/icons/"},
                { from: "src/background_scripts/", to: "background_scripts/" },
                { from: "src/modules", to: "modules/" },
                { from: "src/options", to: "options/" },
                { from: "manifest.json", to: "manifest.json" }
            ]
        })
    ],
}];