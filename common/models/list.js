'use strict';

module.exports = function(List) {

  List.observe('before save', function(ctx, next) {
    if(ctx.instance){
       ctx.instance.userId = ctx.options.accessToken.userId;
    }else if (ctx.data){
       ctx.data.userId = ctx.options.accessToken.userId;
    }
    return next();
  });


};
