require("dotenv").config();

const webpack = require("webpack");
const path = require("path");
const buildPath = path.resolve(__dirname, "build");
const nodeModulesPath = path.resolve(__dirname, "node_modules");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

const package_json = require("./package.json");
const GIT_COMMIT = `${process.env.GITHUB_REF_NAME}.${process.env.GITHUB_SHA}`;
const GIT_BRANCH_MAIN = process.env.GITHUB_REF_NAME == "main";

const MODE = 'production';

const config = {
  mode: MODE,
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
        NODE_ENV: JSON.stringify(MODE),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        BUILD_DATE: JSON.stringify(new Date()),
        GIT_COMMIT: JSON.stringify(GIT_COMMIT),
        IS_DEVELOP: !GIT_BRANCH_MAIN
      },
    }),
    // Allows error warnings but does not stop compiling.
    new webpack.NoEmitOnErrorsPlugin(),
    // Transfer Files
    new CopyWebpackPlugin(
      {
          patterns: [
              { from: 'src/www/html' },
              { from: "src/www/images", to: "images" },
              { from: "src/www/images/icons-dev", to: !GIT_BRANCH_MAIN ? "images/icons" :  "images/icons-dev"},
          ]
      }
    ),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: false, // Whether or not the service worker should start controlling any existing clients as soon as it activates.
      skipWaiting: false,
      maximumFileSizeToCacheInBytes: 10000000, // 10MB
      runtimeCaching: [
        {
          urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 10,
            },
          },
        },
      ],
      exclude: [
        /\.map$/,
        /manifest$/,
        /\.json$/,
        /\.xml$/,
        /\.txt$/,
        /\.html$/,
        /\.ico$/,
        // excluse all files in /images/how-to-install folder and sub folders
        /.*\/images\/how-to-install\/.*$/,
      ],
      // importWorkboxFrom: 'local',
      cleanupOutdatedCaches: true,
      mode: 'production',
    }),
      disableDevLogs: false,
      mode: 'development',
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
    sentryWebpackPlugin({
      release: `${package_json.name}@${package_json.version}-${GIT_COMMIT}`,
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