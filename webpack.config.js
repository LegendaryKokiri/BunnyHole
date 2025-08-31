const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const DIST_PATH = path.join(__dirname, "/dist");

common_config = {
    output: {
        path: DIST_PATH,
        filename: "bunny_hole_[name].js",
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
            }
        ]
    }
}

popup = {
    entry: {
        "popup": "./src/popup.js",
    },

    plugins: [
        new HTMLWebpackPlugin({
            title: "Bunny Hole",
            filename: "./popup.html",
            template: "./src/popup.html"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/icons/", to: "icons/" },
                { from: "src/buttons/", to: "buttons/" },
                { from: "src/background_scripts/", to: "background_scripts/" },
                { from: "src/modules", to: "modules/" },
                { from: "src/options", to: "options/" },
                { from: "manifest.json", to: "manifest.json" }
            ]
        })
    ],

    ...common_config,
};

sidebar = {
    entry: {
        "sidebar": "./src/sidebar.js"
    },

    plugins: [
        new HTMLWebpackPlugin({
            title: "Bunny Hole",
            filename: "./sidebar.html",
            template: "./src/sidebar.html"
        })
    ],

    ...common_config,
};

// The first bundle should clear the dist directory
// popup.output = {...popup.output, clean: true};

module.exports = [ popup, sidebar ];