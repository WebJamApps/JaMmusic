const {
  series, crossEnv, concurrent, rimraf,
} = require('nps-utils');
// const { config: { port: E2E_PORT } } = require('./test/protractor.conf');

module.exports = {
  scripts: {
    default: 'nps webpack',
    test: {
      default: 'nps test.jest',
      jest: {
        default: series(
          rimraf('test/coverage-jest'),
          crossEnv('BABEL_TARGET=node jest'),
        ),
        accept: crossEnv('BABEL_TARGET=node jest -u'),
        watch: crossEnv('BABEL_TARGET=node jest --watch'),
      },
      lint: {
        default: 'eslint . --ext .js',
        fix: 'eslint . --ext .js --fix',
      },
      react: {
        default: crossEnv('BABEL_TARGET=node jest --no-cache --config jest.React.json --notify'),
        accept: crossEnv('BABEL_TARGET=node jest -u --no-cache --config jest.React.json --notify --updateSnapshot'),
        watch: crossEnv('BABEL_TARGET=node jest --watch --no-cache --config jest.React.json --notify'),
      },
      all: concurrent({
        browser: series.nps('test.lint', 'test.jest', 'test.react', 'e2e'),
        jest: 'nps test.jest',
        lint: 'nps test.lint',
      }),
    },
    e2e: {
      default: `${concurrent({
        // webpack: `webpack-dev-server --inline --port=${E2E_PORT}`,
        protractor: 'nps e2e.whenReady',
      })} --kill-others --success first`,
      protractor: {
        install: 'webdriver-manager update',
        default: series(
          'nps e2e.protractor.install',
          'protractor test/protractor.conf.js',
        ),
        debug: series(
          'nps e2e.protractor.install',
          'protractor test/protractor.conf.js --elementExplorer',
        ),
      },
      whenReady: series(
        'nps e2e.protractor',
      ),
    },
    build: 'nps webpack.build',
    webpack: {
      default: 'nps webpack.server',
      build: {
        before: rimraf('dist'),
        default: 'nps webpack.build.production',
        development: {
          default: series(
            'nps webpack.build.before',
            'webpack --progress -d',
          ),
          serve: series.nps(
            'webpack.build.development',
            'serve',
          ),
        },
        production: {
          inlineCss: series(
            'nps webpack.build.before',
            crossEnv('NODE_ENV=production webpack --progress -p --env.production'),
          ),
          default: series(
            'nps webpack.build.before',
            crossEnv('NODE_ENV=production webpack --progress -p --env.production'),
          ),
          serve: series.nps(
            'webpack.build.production',
            'serve',
          ),
        },
      },
      server: {
        default: 'webpack-dev-server -d --inline --env.server',
        hmr: 'webpack-dev-server -d --inline --hot --env.server',
      },
    },
    serve: 'pushstate-server dist',
  },
};
