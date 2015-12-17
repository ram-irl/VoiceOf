var debug = require('debug')('models');

module.exports = function init(database) {
  
  var models = {}
    , onConnected
    ;
    
  console.log('installing models from database:', database);
    
  onConnected = new Promise( (resolve, reject) => {
    database.then(db => {
      try {
        models.users = require('./users')(db);
        debug('installed');
      } catch(e) {
        reject(e);
      }
      resolve(models);
    }, reject);
  });
  
  models.then = onConnected.then.bind(onConnected);
  models.catch = onConnected.catch.bind(onConnected);
  
  return models;
}