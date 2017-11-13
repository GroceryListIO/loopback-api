'use strict';

module.exports = function(List) {
  // Get Lists
  List.getLists = function(options, cb) {
    // User Info
    const token = options && options.accessToken;
    const userId = token && token.userId;
    // Only return lists owned by the user
    List.find({
      where: {
        userId: userId,
      },
    }, cb);
  };

  List.observe('access', function(ctx, next) {
    // Verify user can access object
    // Assume <all records> is handled by its GET endpoint

    const token = ctx.options && ctx.options.accessToken;
    const userId = token && token.userId;
    const user = userId ? 'user#' + userId : '<anonymous>';

    const modelName = ctx.Model.modelName;
    const scope = ctx.query.where ? JSON.stringify(ctx.query.where) : '<all records>';
    // console.log('%s: %s accessed %s:%s', new Date(), user, modelName, scope);

    if (scope != '<all records>') {
      // Verify user can access specific List

      // If the user is looking up their own ID
      if (ctx.query.where && ctx.query.where.id == userId) {
        return next();
      }

      // If the user is listed as the owner in authorizedRoles
      if (!ctx.options.authorizedRoles || ctx.options.authorizedRoles.$owner == true) {
        return next();
      }

      const error = new Error('Access To List Denied.');
      error.status = 401;
      return next(error);
    }

    next();
  });

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
