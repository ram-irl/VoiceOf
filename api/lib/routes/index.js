
module.exports = function (router) {
  // Define routes on `/users` router.
  //require('./users')( router('/users') )
  
  // Define routes on `/posts` router.
  require('./posts.bak')( router('/posts') )
}


module.exports.install = function (app) {
  require('./auth')(app);
  require('./posts')(app);
  
  return app;
}