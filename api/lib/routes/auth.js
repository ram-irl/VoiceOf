var debug = require('debug')('routes:auth');

/**
 * Define routes, on a given router.
 */
module.exports = function (router) {

  // Define /
  router.get('/', function (req, res, next) {
    debug('got req:', req);
    res.send([]);
  });

}