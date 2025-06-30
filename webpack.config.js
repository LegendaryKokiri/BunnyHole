const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const DIST_PATH = path.join(__dirname, "/dist");

module.exports = {
    entry: {
        "popup": "./src/popup.js",
        "sidebar": "./src/sidebar.js"
    },

    output: {
        path: DIST_PATH,
        filename: "bunny_hole_[name].js",
        clean: true
    },

    plugins: [
        new HTMLWebpackPlugin({
            title: "Bunny Hole",
            filename: "./popup.html",
            template: "./src/popup.html"
        }),
        new HTMLWebpackPlugin({
            title: "Bunny Hole",
            filename: "./sidebar.html",
            template: "./src/sidebar.html"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/icons/", to: "icons/" },
                { from: "src/background_scripts/", to: "background_scripts/"},
                { from: "src/modules", to: "modules/"},
                { from: "src/options", to: "options/"},
                { from: "manifest.json", to: "manifest.json"}
            ]
        })
    ],

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
            }
        ]
    }
}