require("dotenv").config();

const webpack = require("webpack");
const path = require("path");
const buildPath = path.resolve(__dirname, "build");
const nodeModulesPath = path.resolve(__dirname, "node_modules");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const SentryCliPlugin = require("@sentry/webpack-plugin");

const GIT_COMMIT = `${process.env.GITHUB_REF_NAME}.${process.env.GITHUB_SHA}`;

const config = {
  mode: "production",
  entry: [path.join(__dirname, "/src/app/app.js")],
  // Render source-map file for final build
  devtool: "source-map",
  // output config
  output: {
    path: buildPath, // Path of output file
    filename: "app.js", // Name of output file
  },
  plugins: [
    new CleanWebpackPlugin(),
    // Define production build to allow React to strip out unnecessary checks
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: "production",
        SENTRY_DSN: `${process.env.SENTRY_DSN}`,
        BUILD_DATE: `${new Date()}`,
        GIT_COMMIT: GIT_COMMIT,
      },
    }),
    // Allows error warnings but does not stop compiling.
    new webpack.NoEmitOnErrorsPlugin(),
    // Transfer Files
    new CopyWebpackPlugin(

      {
          patterns: [
              { from: 'src/www/html' },
              { from: "src/www/images", to: "images" }
          ]
      }
    ),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling 'old' SWs to hang around
      clientsClaim: false,
      skipWaiting: false,
      include: [
        /\.html$/,
        /\.js$/,
        /\.jpg$/,
        /\.svg$/,
        /\.png$/,
        /\.json$/,
        /\.xml$/,
      ],
    }),
    new SentryCliPlugin({
      release: "seven23@1.0.0-" + GIT_COMMIT,
      include: "build",
      ignoreFile: ".sentrycliignore",
      ignore: [
        "node_modules",
        "webpack-dev-server.config.js",
        "webpack-production.config.js",
      ],
    }),
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
        test: /\.scss$/,
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