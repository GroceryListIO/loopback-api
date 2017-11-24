'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var RateLimit = require('express-rate-limit');

var app = module.exports = loopback();

var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

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
  max: 25,
  delayMs: 0, // disabled
});

app.use(defaultApiLimiter);
app.use('/api/Users/', tightApiLimiter);

// Start the web server
app.start = function() {
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

// Load the provider configurations
var config = {};
try {
  config = require('./providers.json');
} catch (err) {
  console.error('Please configure your passport strategy in `providers.json`.');
  console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
  process.exit(1);
}
// Initialize passport
passportConfigurator.init();

// Set up passport related models
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});

// Configure passport strategies for third party auth providers
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}
