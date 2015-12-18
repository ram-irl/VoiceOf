var debug = require('debug')('routes:posts');

/**
 * Define routes, on a given router.
 */
module.exports = function (app) {
  var models = app.models;
  app.server.post('/posts', function (req, res, next) {
    var token = req.token;
    var post = Object.assign({}, req.body);
    post.author = req.token.userId;
    models.posts.create(post)
    .then(post => {
      res.setHeader('Location', '/posts/' + post._id);
      res.send(201, post);
    })
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });
  app.server.get('/posts/:postId', function (req, res, next) {
    var token = req.token;
    var post = Object.assign({}, req.body);
    post.author = req.token.userId;
    models.posts.get(req.params.postId)
    .then(post => {
      res.setHeader('Location', '/posts/' + post._id);
      res.send(200, post);
    })
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });
}
