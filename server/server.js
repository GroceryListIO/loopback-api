'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var RateLimit = require('express-rate-limit');

var app = module.exports = loopback();

// Logging
if (process.env.NODE_ENV == 'production') {
  console.log('Production Mode: Enabling logging.');
  const bunyan = require('bunyan');
  const LoggingBunyan = require('@google-cloud/logging-bunyan'); // Google Cloud client library for Bunyan
  const loggingBunyan = new LoggingBunyan(); // Creates a Bunyan Stackdriver Logging client
  const rootLogger = bunyan.createLogger({
    name: 'api',
    level: 'info',
    streams: [
      {stream: process.stdout},
      loggingBunyan.stream(),
    ],
  });
  const logger = require('loopback-component-logger')(rootLogger);
}

// Rate Limit
app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)

var defaultApiLimiter = new RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  delayMs: 0, // disabled
});

var tightApiLimiter = new RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  delayMs: 0, // disabled
});

app.use(defaultApiLimiter);
app.use('/api/Users/', tightApiLimiter);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s in mode:', baseUrl, process.env.NODE_ENV || 'default');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
