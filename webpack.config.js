require('dotenv').config();
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { ProvidePlugin } = require('webpack');
const webpack = require('webpack');
// const TerserPlugin = require('terser-webpack-plugin');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || []; // eslint-disable-line no-mixed-operators
const when = (condition, config, negativeConfig) => (condition ? ensureArray(config) : ensureArray(negativeConfig));

// primary config:
const title = 'Web Jam LLC';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const baseUrl = '/';
const scssRules = [{ loader: 'sass-loader' }];

module.exports = ({
  production, analyze,
} = {
}) => ({
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // modules: [srcDir, 'node_modules'],
  },

  entry: {
    app: [`${srcDir}/main.tsx`],
    vendor: ['jquery', 'bootstrap'],
  },

  mode: production ? 'production' : 'development',

  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    // sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js',
  },

  performance: { hints: false },

  devServer: {
    contentBase: outDir,
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

  devtool: production ? 'nosources-source-map' : 'source-map',

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
        use: { loader: 'awesome-typescript-loader' },
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
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: [
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS, using Node Sass by default
        ],
      },
      // Still needed for some node modules that use CSS
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/i,
        issuer: [{ test: /\.html$/i }],
        // SCSS required in templates cannot be extracted safely
        use: scssRules,
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
    }),
    new HtmlWebpackPlugin({
      template: `${srcDir}/index.ejs`,
      minify: production ? { removeComments: true, collapseWhitespace: true } : undefined,
      metadata: { title, baseUrl },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true,
      metadata: { title, baseUrl },
    }),
    new CopyWebpackPlugin([
      { from: 'static/favicon.ico', to: 'favicon.ico' },
      { from: 'static/imgs', to: 'static/imgs' },
    ]),
    new webpack.EnvironmentPlugin(['SCS_PORT', 'SCS_HOST', 'SOCKETCLUSTER_SECURE', 'NODE_ENV',
      'AuthProductionBaseURL', 'PORT', 'BackendUrl', 'GoogleClientId', 'userRoles', 'HashString', 'TINY_KEY']),
    ...when(analyze, new BundleAnalyzerPlugin()),
  ],
});
