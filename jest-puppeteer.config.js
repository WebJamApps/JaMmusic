require('dotenv').config();

module.exports = {
  launch: {
    headless: false,
  },
  server: {
    setTimeout: 10000,
    launchTimeout: 100000,
    command: 'yarn build:prod && node server.js',
    port: process.env.PORT,
  },
};
