require('dotenv').config();

module.exports = {
  // launch: { headless: true, devtools: true },
  server: {
    launchTimeout: 40000,
    command: 'yarn postinstall && node server.js',
    port: process.env.PORT,
  },
};
