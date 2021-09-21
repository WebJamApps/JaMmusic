/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { ProvidePlugin } = require('webpack');
const webpack = require('webpack');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || []; // eslint-disable-line no-mixed-operators
const when = (condition, config, negativeConfig) => (condition ? ensureArray(config) : ensureArray(negativeConfig));

// primary config:
const nodeEnv = process.env.NODE_ENV || 'development';
const title = 'Web Jam LLC';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const baseUrl = '/';
const googleMapKey = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}`;
const envVars = ['APP_NAME', 'SCS_PORT', 'SCS_HOST', 'SOCKETCLUSTER_SECURE', 'NODE_ENV',
  'BackendUrl', 'GoogleClientId', 'userRoles', 'HashString', 'TINY_KEY'];
if (nodeEnv === 'development')envVars.push('PORT');

module.exports = (env) => ({
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: { // needed for jsonwebtoken
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
    },
  },

  entry: {
    app: [`${srcDir}/index.tsx`],
    vendor: ['jquery', 'bootstrap'],
  },

  mode: env.production ? 'production' : 'development',

  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: env.production ? '[name].[chunkhash].bundle.js' : '[name].[fullhash].bundle.js',
    chunkFilename: env.production ? '[name].[chunkhash].chunk.js' : '[name].[fullhash].chunk.js',
  },

  performance: { hints: false },

  devServer: {
    static: outDir,
    hot: true,
    historyApiFallback: { // serve index.html for all 404 (required for push-state)
      rewrites: [
        { from: /^\/$/, to: '/' },
        { from: /^\//, to: '/' },
        { from: /./, to: '/' },
      ],
    },
    port: parseInt(process.env.PORT, 10),
  },

  devtool: env.production ? 'nosources-source-map' : 'source-map',

  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles', test: /\.css$/i, chunks: 'all', enforce: true,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: { loader: 'ts-loader' },
        exclude: [/node_modules/],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
      // SCSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using dart sass
        ],
      },
      // Still needed for some node modules that use CSS
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      { test: /\.html$/i, loader: 'html-loader' }, // eslint-disable-next-line no-useless-escape
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
      // load these fonts normally, as files:
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
    ],
  },

  plugins: [
    new ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      template: `${srcDir}/index.ejs`,
      minify: env.production ? { removeComments: true, collapseWhitespace: true } : undefined,
      metadata: { title, baseUrl, googleMapKey },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'static/favicon.ico', to: 'favicon.ico' },
        { from: 'static/imgs', to: 'static/imgs' },
      ],
    }),
    new webpack.EnvironmentPlugin(envVars),
    ...when(env.analyze, new BundleAnalyzerPlugin()),
  ],
});
