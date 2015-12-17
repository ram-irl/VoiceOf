module.exports.install = function install(app) {
  
  
  
  var middleware = app.middleware = {
    'authorize': require('./authorize')
  };
  
  app.server.use(middleware.authorize(app));

  return app;
}