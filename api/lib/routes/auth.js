var debug = require('debug')('routes:auth')
  , jwt = require('jwt-simple')
  , errors = require('restify').errors
  ;

/**
 * Define routes, on a given router.
 */
module.exports = function (app) {
  // Define /
  var models = app.models
    , auth = app.middleware.authorize
    ;
  
  app.server.put('/auth/facebook', function (req, res, next) {
    var token = req.token;
    if (token.type === 'app' || token.type === 'session') {
      // do something with body;
      models
        .users.create.fromFacebook(req.body)
        .then(user => {
          res.setHeader('Location', '/users/' + user._id);
          return user;
        })
        .then(auth.sessionToken.fromAppToken(req.token))
        .then(sessionToken => res.send( (sessionToken.isNew ? 201 : 200), sessionToken))
        .catch( e => res.send(new errors.InternalServerError({'message': e.message})) )
    } else {
      res.send(new errors.UnauthorizedError({'message': 'Invalid Authorization parameter [code 3]'}));
    }
  });

}