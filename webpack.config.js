require('dotenv').config();
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { ProvidePlugin } = require('webpack');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

// config helpers:
const ensureArray = config => config && (Array.isArray(config) ? config : [config]) || []; // eslint-disable-line no-mixed-operators
const when = (condition, config, negativeConfig) => (condition ? ensureArray(config) : ensureArray(negativeConfig));

// primary config:
const title = 'Web Jam LLC';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/music';
const cssRules = [{ loader: 'css-loader' }];

module.exports = ({
  production, extractCss, coverage, analyze,
} = {
}) => ({
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [srcDir, 'node_modules'],
  },

  entry: {
    app: [`${srcDir}/main.js`],
    vendor: ['jquery', 'bootstrap'],
  },

  mode: production ? 'production' : 'development',

  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js',
  },

  performance: { hints: false },

  devServer: {
    contentBase: outDir,
    hot: true,
    // // serve index.html for all 404 (required for push-state)
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/music' },
        { from: /^\/music/, to: '/music' },
        { from: /./, to: '/music' },
      ],
    },
    port: parseInt(process.env.PORT, 10),
  },

  devtool: production ? 'nosources-source-map' : 'cheap-module-eval-source-map',

  optimization: {
    minimizer: production ? [
      new TerserPlugin({
        extractComments: true,
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          extractComments: 'all',
          compress: {
            drop_console: true,
          },
        },
      }),
    ] : [],
  },

  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: extractCss ? ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: cssRules,
        }) : ['style-loader', ...cssRules],
      },
      {
        test: /\.css$/i,
        issuer: [{ test: /\.html$/i }],
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules,
      },
      { test: /\.html$/i, loader: 'html-loader' },
      {
        test: /\.jsx?$/i,
        loader: 'babel-loader',
        exclude: nodeModulesDir,
        options: coverage ? { sourceMap: 'inline', plugins: ['istanbul'] } : {},
      }, // eslint-disable-next-line no-useless-escape
      { test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/, loader: 'expose-loader?Promise' },
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
    new CopyWebpackPlugin([
      { from: 'static/favicon.ico', to: 'favicon.ico' },
      { from: 'static/tour.json', to: 'tour.json' },
      { from: 'static/imgs', to: 'static/imgs' },
    ]),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'AuthProductionBaseURL', 'PORT', 'BackendUrl', 'GoogleClientId', 'userRoles']),
    ...when(extractCss, new ExtractTextPlugin({
      filename: production ? '[md5:contenthash:hex:20].css' : '[id].css',
      allChunks: true,
    })),
    // ...when(production, new CopyWebpackPlugin([
    //   { from: 'static/favicon.ico', to: 'favicon.ico' }])),
    ...when(analyze, new BundleAnalyzerPlugin()),
  ],
});
