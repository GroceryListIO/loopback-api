'use strict';

module.exports = function(Item) {

    Item.observe('access', function (ctx, next) {
        const token = ctx.options && ctx.options.accessToken;
        const userId = token && token.userId;
        const user = userId ? 'user#' + userId : '<anonymous>';

        const modelName = ctx.Model.modelName;
        const scope = ctx.where ? JSON.stringify(ctx.where) : '<all records>';
        console.log('%s: %s accessed %s:%s', new Date(), user, modelName, scope);
        if (scope == "<all records>") {
            // We should verify the user can do such things.
            console.log("Papers please")
            console.log(JSON.stringify(ctx))
        }
        next();
    });
    
};
