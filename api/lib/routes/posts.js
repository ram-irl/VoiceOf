var debug = require('debug')('routes:posts');

/**
 * Define routes, on a given router.
 */
module.exports = function (app) {

  // Define /
  app.server.get('/posts', function (req, res, next) {
    debug('got req:');
    res.send([]);
  });

}