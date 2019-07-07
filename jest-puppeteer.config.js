require('dotenv').config();

module.exports = {
  server: {
    launchTimeout: 40000,
    command: 'yarn build:prod && node server.js',
    port: process.env.PORT,
  },
};
