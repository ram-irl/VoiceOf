var restify = require('restify')
  , debug = require('debug')('server')
  ;

var Server = module.exports = function createServer(opts) {
  restify.CORS.ALLOW_HEADERS.push( "authorization"        );
  restify.CORS.ALLOW_HEADERS.push( "withcredentials"      );
  restify.CORS.ALLOW_HEADERS.push( "x-requested-with"     );
  restify.CORS.ALLOW_HEADERS.push( "x-forwarded-for"      );
  restify.CORS.ALLOW_HEADERS.push( "x-real-ip"            );
  restify.CORS.ALLOW_HEADERS.push( "x-customheader"       );
  restify.CORS.ALLOW_HEADERS.push( "user-agent"           );
  restify.CORS.ALLOW_HEADERS.push( "keep-alive"           );
  restify.CORS.ALLOW_HEADERS.push( "host"                 );
  restify.CORS.ALLOW_HEADERS.push( "accept"               );
  restify.CORS.ALLOW_HEADERS.push( "connection"           );
  restify.CORS.ALLOW_HEADERS.push( "upgrade"              );
  restify.CORS.ALLOW_HEADERS.push( "content-type"         );
  restify.CORS.ALLOW_HEADERS.push( "dnt"                  ); // Do not track
  restify.CORS.ALLOW_HEADERS.push( "if-modified-since"    );
  restify.CORS.ALLOW_HEADERS.push( "cache-control"        );
  var server = restify.createServer(opts);
  server.pre(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
  });
  server.use(restify.bodyParser({'mapParams': false}));
  server.use(restify.queryParser());
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
