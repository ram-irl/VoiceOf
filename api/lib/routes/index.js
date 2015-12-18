/***********************************************************************
 * MODULE `routes`
 * Provides functions to install routes within the platform.
 **********************************************************************/


/**
 * Installs routes on a given Application.
 *
 * @param   Object  app   The application to install routes.
 * @return  Object        Returns the application with installed routes.
 */
module.exports.install = function (app) {
  require('./auth')(app);
  require('./posts')(app);
  require('./comments')(app);

  return app;
}
