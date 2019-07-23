require("dotenv").config();

const webpack = require("webpack");
const path = require("path");
const buildPath = path.resolve(__dirname, "build");
const nodeModulesPath = path.resolve(__dirname, "node_modules");
const TransferWebpackPlugin = require("transfer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const SentryCliPlugin = require("@sentry/webpack-plugin");

const config = {
  entry: [path.join(__dirname, "/src/app/app.js")],
  // Render source-map file for final build
  devtool: "source-map",
  // output config
  output: {
    path: buildPath, // Path of output file
    filename: "app.js" // Name of output file
  },
  plugins: [
    new CleanWebpackPlugin(),
    // Define production build to allow React to strip out unnecessary checks
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        BUILD_DATE: JSON.stringify(new Date()),
        TRAVIS_COMMIT: JSON.stringify(process.env.TRAVIS_COMMIT)
      }
    }),
    // Allows error warnings but does not stop compiling.
    new webpack.NoEmitOnErrorsPlugin(),
    // Transfer Files
    new TransferWebpackPlugin(
      [
        { from: "www/html" },
        { from: "www/config" },
        { from: "www/images", to: "images" }
      ],
      path.resolve(__dirname, "src")
    ),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling 'old' SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      include: [
        /\.html$/,
        /\.js$/,
        /\.jpg$/,
        /\.svg$/,
        /\.png$/,
        /\.json$/,
        /\.xml$/
      ],
      runtimeCaching: [
        {
          urlPattern: /./,
          handler: "NetworkFirst"
        }
      ]
    }),
    new SentryCliPlugin({
      release: "seven23@1.0.0-build." + process.env.TRAVIS_COMMIT,
      include: ".",
      ignoreFile: ".sentrycliignore",
      ignore: [
        "node_modules",
        "webpack-dev-server.config.js",
        "webpack-production.config.js"
      ],
      configFile: "sentry.properties"
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/, // All .js files
        use: [
          "babel-loader?presets[]=env&presets[]=react&presets[]=stage-2&sourceMaps=true&plugins[]=syntax-async-functions"
        ], // react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath]
      },
      {
        test: /\.worker.js$/,
        loader: "worker-loader?inline&fallback=false"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
        loader: "file-loader?name=[name].[ext]"
      }
    ]
  }
};

module.exports = config;
