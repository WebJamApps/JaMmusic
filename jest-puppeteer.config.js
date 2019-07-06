require('dotenv').config();

module.exports = {
  server: {
    launchTimeout: 20000,
    command: 'yarn build:prod && node server.js',
    port: process.env.PORT,
  },
};
