'use strict';
const crypto = require('crypto');
var path = require('path');

module.exports = function(user) {
  // Before Save - Add profile pic
  user.observe('before save', function(ctx, next) {
    if (!ctx.instance.profilePic && ctx.instance.email) {
      let email = ctx.instance.email.trim().toLowerCase();
      let emailHash = crypto.createHash('md5').update(email).digest('hex');
      ctx.instance.profilePic = 'https://www.gravatar.com/avatar/' + emailHash;
      // console.log('Profile pic generated: %s', ctx.instance.profilePic);
    }
    return next();
  });

  // Send verification email after registration
  user.afterRemote('create', function(context, userInstance, next) {
    if (process.env.NODE_ENV != 'production') {
      return next();
    }

    var options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@grocerylist.io',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/emailTemplates/verify.ejs'),
      redirect: 'https://app.grocerylist.io',
      user: user,
      host: "https://api.grocerylist.io",
      port: 80
    };

    userInstance.verify(options, function(err, response, next) {
      if (err) return next(err);
    });
    return next();
  });

  // Attach to email dataSource
  user.getApp(function(err, app) {
    user.email.attachTo(app.dataSources.emailDataSource);
  });
};
