var debug = require('debug')('routes:posts');

/**
 * Define routes, on a given router.
 */
module.exports = function (app) {
  var models = app.models;
  app.server.put('/posts', function (req, res, next) {
    var token = req.token;
    var post = Object.assign({}, req.body);
    post.author = req.token.userId;
    models.posts.create(post)
    .then(post => {
      res.setHeader('Location', '/posts/' + post.insertedId);
      res.send(201, post.insertedId);
    })
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });
  app.server.get('/posts/search', function(req, res, next){
    if(!req.query.lat || !req.query.lng || !req.query.rad){
      return res.send(new errors.UnauthorizedError({'message': 'Required Fields Missing'}));
    }
    models.posts.search({ lng: parseFloat(req.query.lng), lat: parseFloat(req.query.lat)}, parseInt(req.query.rad))
    .then(posts => {
      res.send(200, posts);
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
  app.server.put("/posts/:postId/vote", function(req, res, next){
    var token = req.token;
    models.posts.vote(req.params.postId, token.userId)
    .then(() => res.send(201))
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });
  app.server.put("/posts/:postId/statuses/completed", function(req, res, next){
    var token = req.token;
    models.posts.setStatus(req.params.postId, token.userId, "completed")
    .then(() => res.send(201))
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });
}
