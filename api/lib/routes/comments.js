var debug = require('debug')('routes:posts')
    , _ = require("underscore")._
    , errors = require('restify').errors;

/**
 * Define routes, on a given router.
 */
module.exports = function (app) {
  var models = app.models;

  app.server.post('/posts/:postId/comments', function (req, res, next) {
    var token = req.token;
    if(_.isString(req.body.content) && req.body.content.length > 2048){
      return res.send(new errors.UnauthorizedError({'message': 'Comment length exceeded'}));
    }
    var comment = Object.assign({}, { content: req.body.content, owner: token.userId, post: req.params.postId });
    models.posts.get(req.params.postId)
    .then(post => {
      if(!post)
        throw new Error("Post Not Found");
      return post;
    })
    .then(() => app.models.comments.add(comment))
    .then(doc => {
      res.setHeader('Location', '/posts/' + req.params.postId + "/comments/" + doc.insertedId);
      res.send(201, doc.insertedId);
    })
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });

  app.server.get('/posts/:postId/comments', function (req, res, next) {
    models.comments.getAll(req.params.postId)
    .then(comments => res.send(200, comments))
    .catch(e => res.send(new errors.InternalServerError({'message': e.message})));
  });

}
