/***********************************************************************
 * Middleware module.
 * Provides middleware installer for the REST API gateway app.
 **********************************************************************/

var authorize = require('./authorize')
  ;
 
var middleware = module.exports = {};

// Exports `authorize` middleware.
middleware.authorize = authorize;


/**
 * Installs required middleware, on a given app.
 *
 * @param   Object  app   The Application to install middleware on.
 * @return  Object        The Application.
 */
middleware.install = function install(app) {

  // Expose `middleware` module to the app.
  app.middleware = middleware;

  // Install middleware modules onto the app.
  app.server.use(middleware.authorize(app));  // Authorize.

  return app;
}