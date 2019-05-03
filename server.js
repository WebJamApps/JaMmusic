require('dotenv').config();
const path = require('path');
const express = require('express');
const enforce = require('express-sslify');

const app = express();

/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') app.use(enforce.HTTPS({ trustProtoHeader: true }));

app.use(express.static(path.normalize(path.join(__dirname, 'dist'))));
app.use('/music/', express.static(path.normalize(path.join(__dirname, 'dist'))));
app.get('/music/*', (request, response) => {
  response.sendFile(path.normalize(path.join(__dirname, 'dist/index.html')));
});
app.listen(process.env.PORT, () => {
  console.log(`Magic happens on port ${process.env.PORT}`); // eslint-disable-line no-console
});

module.exports = app;
