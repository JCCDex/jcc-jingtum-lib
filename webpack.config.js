const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const config = {
  entry: "./src",
  output: {
    filename: "jcc-jingtum-lib.min.js",
    path: path.resolve(__dirname, "./dist")
  },
  target: "web",
  resolve: {
    extensions: [".js", ".ts"],
    fallback: {
      tls: false,
      net: false,
      fs: false,
      child_process: false
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader"
      },
      {
        test: /\.(cjs|mjs|js|jsx)$/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [new DuplicatePackageCheckerPlugin(), new NodePolyfillPlugin()]
};

if (process.env.REPORT === "true") {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
