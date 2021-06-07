/* eslint-disable @typescript-eslint/no-var-requires */
const {
  series, crossEnv, concurrent, rimraf,
} = require('nps-utils');

require('dotenv').config();

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
        default: 'eslint . --ext .js,.ts,.tsx',
        fix: 'eslint . --ext .js,.ts,.tsx --fix',
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
    build: 'nps webpack.build',
    webpack: {
      default: 'nps webpack.server',
      build: {
        before: rimraf('dist'),
        default: 'nps webpack.build.production',
        development: {
          default: series(
            'nps webpack.build.before',
            'npx webpack --progress --node-env=development --env.development',
          ),
          serve: series.nps(
            'webpack.build.development',
            'serve',
          ),
        },
        production: {
          inlineCss: series(
            'nps webpack.build.before',
            crossEnv('npx webpack  --node-env=production --progress --env.production'),
          ),
          default: series(
            'nps webpack.build.before',
            crossEnv('npx webpack --node-env=production --progress --env production'),
          ),
          serve: series.nps(
            'webpack.build.production',
            'serve',
          ),
        },
      },
      server: {
        default: 'webpack serve --node-env=development --env --inline',
        hmr: 'webpack serve --node-env=development --env --inline --hot',
      },
    },
    serve: 'pushstate-server dist',
  },
};
