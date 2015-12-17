var restify = require('restify')
  , debug = require('debug')('server')
  ;
  
var Server = module.exports = function createServer(opts) {
  var server = restify.createServer(opts);
  server.errors = restify.errors;
  return server;
}

/**
 * Creates a server initiator that will start the server listening on given port.
 *
 * @return Function A callable that starts the given server.
 */
Server.start = function startServer(port) {

  /**
   * Function that starts the given server.
   *
   * @return Promise
   */
  return function(server) {
    // Return a Promise.
    return new Promise( (resolve, reject) => {
    
      /**
       * Clean-up function.
       * Remove event listeners once the promise is fulfilled.
       */
      function cleanup() {
        // Remove the `error` event listener.
        server.removeListener('error', onError);
        // Remove the `listening` event listener.
        server.removeListener('listening', onListening);
      }
    
      /**
       * On `error` event listener.
       */
      function onError(e) {
        // Remove any listeners.
        cleanup();
        console.log(e);
        // Reject the promise with given Error `e` object.
        reject(e);
      }
      
      /**
       * On `listening` event listener.
       */
      function onListening() {
        // Remove listeners.
        cleanup();
        debug('%s listening at %s', server.name, server.url);
        // Resolve promise, returning the server instance.
        resolve(server);
      }
      
      /**
       * Install `error` and `listening` event listeners on the given
       * server instance.
       */
      (function addListeners(server) {
        server.on('listening', onListening);
        server.on('error', onError);
      })(server)
    
      // Start listening on port.
      server.listen(port);
    })
  }
}