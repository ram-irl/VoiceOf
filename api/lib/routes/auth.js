/***********************************************************************
 * ROUTES `auth`
 * Provides routes for the /auth path.
 **********************************************************************/
 

/**
 * Declare variables
 */

var debug = require('debug')('routes:auth')
  , jwt = require('jwt-simple')
  , errors = require('restify').errors
  ;

/**
 * Install /auth routes on a given app.
 *
 * @param   Object app    The application to install the routes on.
 * @return  Object      Returns the application with the routes installed on.
 */
module.exports = function (app) {
  // References to outside modules.
  var models = app.models               // The `models` module
    , auth = app.middleware.authorize   // The `authorize` middleware
    ;
  
  /**
   *  Route: PUT /auth/facebook
   *  Allows the client app to send a Facebook authResponse, for which
   *  an user is created/updated and fetched from the database,
   *  while providing a Session token linked to the fetched user.
   *
   *  Requires: APP_TOKEN (header Authentication: APP_TOKEN)
   *
   *  @param    body    JSON        The `authResponse` object received from Facebook login/authentication.
   *  @returns  header  Location    The URI for the user resource associated with the Facebook account
   *            body    JSON        A JSON {'token': SESSION_TOKEN}
   */
  app.server.put('/auth/facebook', function (req, res, next) {
    
    var token = req.token;
    if (token.type === 'app' || token.type === 'session') {
      // Create/Update and fetch a user from the database,
      // associated with the given Facebook token data.
      models
        .users.create.fromFacebook(req.body)
        // set the Location header.
        .then(user => {
          // Update the Location header with local path of the URI,
          // for the user resource.
          res.setHeader('Location', '/users/' + user._id);
          return user;
        })
        // Exchange the APP_TOKEN with a SESSION_TOKEN.
        .then(auth.sessionToken.fromAppToken(req.token))
        // Send the session token as response payload.
        .then(sessionToken => res.send( (sessionToken.isNew ? 201 : 200), sessionToken))
        // Any errors, just send them as InternalServerError.
        .catch( e => res.send(new errors.InternalServerError({'message': e.message})) )
    } else {
      res.send(new errors.UnauthorizedError({'message': 'Invalid Authorization parameter [code 3]'}));
    }
    
  });

}