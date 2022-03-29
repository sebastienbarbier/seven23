const webpack = require("webpack");
const path = require("path");
const buildPath = path.resolve(__dirname, "build");
const nodeModulesPath = path.resolve(__dirname, "node_modules");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const config = {
  mode: "production",
  // Entry points to the project
  entry: ["./src/app/app.js"],
  // Server Configuration options
  devServer: {
    static: {
      directory: "src/www/html",
    },
    compress: true,
    port: 3000, // Port Number
    host: "0.0.0.0", // Change to '0.0.0.0' for external facing server
    historyApiFallback: true,
    allowedHosts: "all",
  },
  devtool: "eval",
  output: {
    path: buildPath, // Path of output file
    filename: "app.js",
    globalObject: "this",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
      },
    }),
    // Enables Hot Modules Replacement
    new webpack.HotModuleReplacementPlugin(),
    // Allows error warnings but does not stop compiling.
    new webpack.NoEmitOnErrorsPlugin(),
    // Moves files
    new CopyWebpackPlugin(
      {
          patterns: [
              { from: 'src/www/html' },
              { from: "src/www/images", to: "images" }
          ]
      }
      // [{ from: "www/html" }, { from: "www/images", to: "images" }],
      // path.resolve(__dirname, "src")
    ),
    // new WorkboxPlugin.GenerateSW({
    //   // these options encourage the ServiceWorkers to get in there fast
    //   // and not allow any straggling 'old' SWs to hang around
    //   clientsClaim: false,
    //   skipWaiting: false
    // })
  ],
  module: {
    rules: [
      {
        // React-hot loader and
        test: /\.js$/, // All .js files
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/react"],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-transform-runtime",
            "@babel/transform-arrow-functions",
          ],
        },
        exclude: [nodeModulesPath],
      },
      {
        test: /\.worker.js$/,
        loader: "worker-loader",
        options: {
          inline: "fallback",
          filename: "[name].[contenthash].worker.js",
        },
      },
      {
        test: /\.(scss|css)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name : 'name=[name].[ext]'
                }
            }
        ]
      },
    ],
  },
};

module.exports = config;