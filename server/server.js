'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

// Logging
const bunyan = require('bunyan');
if (process.env.NODE_ENV == 'production') {
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
} else {
  const rootLogger = bunyan.createLogger({
    name: 'api',
    level: 'info',
  });
  const logger = require('loopback-component-logger')(rootLogger);
}

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s in mode:', baseUrl, process.env.NODE_ENV || "default");
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
