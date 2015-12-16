
module.exports = function (router) {
  // Define routes on `/users` router.
  //require('./users')( router('/users') )
  
  // Define routes on `/posts` router.
  require('./posts')( router('/posts') )
}