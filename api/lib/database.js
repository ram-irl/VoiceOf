var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , debug = require('debug')('database')
  ;
  
var database = module.exports = function (uri) {
  // Connection URL
  var url = 'mongodb://localhost:27017/myproject';
  
  var database = {'uri': uri};
  
  database.connect = function (uri) {
    uri = uri || database.uri;
    
    return new Promise( (resolve, reject) => {
    
      MongoClient.connect(uri, function (err, db) {
        if (!err) {
          debug('Connected to %s', uri);
          resolve(db);
        } else {
          debug('Error connecting to %s', uri, err);
          reject(err);
        }
      });
      
    })
    
  }
  
  return database;
}
