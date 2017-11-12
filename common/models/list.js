'use strict';

module.exports = function(List) {
  // Get Lists
  List.getLists = function (options, cb) {

    // User Info
    const token = options && options.accessToken;
    const userId = token && token.userId;
    console.log('User ID: %s', userId)

    // Only return lists owned by the user
    List.find({
      where: {
        userId: userId
      }
    }, cb);

  };

  // Update
  List.observe('before save', function(ctx, next) {
    if (ctx.instance) {
      ctx.instance.userId = ctx.options.accessToken.userId;
    } else if (ctx.data) {
      ctx.data.userId = ctx.options.accessToken.userId;
    }
    return next();
  });
};
