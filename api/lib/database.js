var mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient
  , debug = require('debug')('database')
  , EventEmitter = require('events').EventEmitter
  ;
  
var database = module.exports = function (uri) {
  // Connection URL
  var database = {'uri': uri}
    , connect = new EventEmitter()
    ;
  
  var onConnect = new Promise( (resolve, reject) => {
  
    connect.on('db', function(db) {
      database.db = db;
      db.on('close', function() {
        database.db = null;
      });
      resolve(db);
    });
    
    connect.on('error', reject);
  });
  
  database.connect = function (uri) {
    uri = uri || database.uri;
    
    if (database.db && database.db.isConnected()) {
      return Promise.resolve(database.db);
    }
    
    MongoClient.connect(uri, function (err, db) {
      if (!err) {
        debug('Connected to %s', uri);
        connect.emit('db', db);
      } else {
        connect.emit('error', err);
      }
    });
    
    return onConnect;
  }
  
  database.then = onConnect.then.bind(onConnect);
  database.catch = onConnect.catch.bind(onConnect);
  
  return database;
}
