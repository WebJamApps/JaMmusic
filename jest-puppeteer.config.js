require('dotenv').config();

module.exports = {
  // launch: { headless: true, devtools: true },
  server: {
    launchTimeout: 10000,
    command: 'yarn postinstall && node server.js',
    port: process.env.PORT
  }
};
