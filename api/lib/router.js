var installRoutes = require('./routes')
  , debug = require('debug')('voiceof:router')
  ;

/**
 * Methods supported by the HTTP server.
 */
var methods = [
  'del',
  'get',
  'head',
  'opts',
  'post',
  'put',
  'patch'
];

/**
 * Install routes on `app` server, using routers.
 *
 * @return Promise
 */
module.exports = function (app) {

  /**
   * Create a new router, on a given path.
   *
   * @return Function  A router constructor for child paths, and methods for a given base path.
   */
  function createRouter(basePath) {
    /**
     * Router child constructor.
     */
    var router = function(path) {
      // Return a new router for the given path.
      return createRouter(path);
    };
    
    router.path = basePath;

    // Iterate through the methods.
    methods.forEach(function (methodName) {
      // Create a method named `methodName`, that will provide the means
      // to add routes to a given path, relative to a parent path (`router.path`)
      router[methodName] = function (path) {
        var args = Array.prototype.slice.call(arguments);
        
        if (typeof args[0] === 'string') {
          args[0] = (basePath ? basePath + '/' + (args[0][0] === '/' ? args[0].substr(1) : args[0]) : args[0]);
        }
        debug('installing route - %s %s ', methodName.toUpperCase(), args[0]);
        return app[methodName].apply(app, args);
      }
    });

    return router;
  }

  // Install routes on a default router.
  installRoutes(
    createRouter('') // default router.
  );
  
  return Promise.resolve(app);
}