require('dotenv').config();

module.exports = {
  server: {
    launchTimeout: 30000,
    command: 'yarn build:prod && node server.js',
    port: process.env.PORT,
  },
};
