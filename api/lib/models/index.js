/***********************************************************************
 * MODULE `models`
 * Provides functions to handle model objects within the platform.
 **********************************************************************/
 

/**
 * Declare variables
 */
var debug = require('debug')('models')
  , mod_users = require('./users')
  ;

/**
 * Module init(), to provide models for a given database connection.
 *
 * @param   Object  database  The Database object to initialize models with.
 * @return  Object            An object with property names linking to models.
 */
module.exports = function init(database) {
  
  var models = {}     // The final object to be returned.
    , onConnected     // A Promise reference.
    ;
    
  debug('installing models for database:', database.uri);
  
  // Create a Promise that fulfills on modules loaded.
  onConnected = new Promise( (resolve, reject) => {
    // Since model init requires a valid mongodb Database handle,
    // wait for `database` to connect and provide one.
    database.then(db => {
      try {
        // Init each imported module.
        models.users = mod_users(db); // Initialize Users model.
        
        debug('module initialized');
      } catch(e) {
        debug('FAILED to initialize module');
        reject(e);
      }
      
      // Unless a reject's been triggered, the promise will return the
      // updated `models` object.
      resolve(models);
    
    }, reject);
  });
  
  // Provide `then()` on the `models` object, bound to the promise.
  models.then = onConnected.then.bind(onConnected);
  // Provide `catch()` on the `models` object, bound to the promise.
  models.catch = onConnected.catch.bind(onConnected);
  
  // Return
  return models;
}