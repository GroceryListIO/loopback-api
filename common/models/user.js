'use strict';
const crypto = require('crypto');

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
};
