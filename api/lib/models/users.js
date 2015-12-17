var mongo = require('mongodb')
  , ObjectId = mongo.ObjectId
  , debug = require('debug')('models:users');
  ;
  
const ERR_USER_NOT_FOUND = 101;

module.exports = function(db){

  var collection = db.collection('users');

  function getUser(id) {
    return collection.findOne({'_id': ObjectId(id)});
  }
  
  getUser.fromFacebook = function (authResponse) {
    return new Promise( (resolve, reject) => {
      
      if (authResponse && authResponse.userID) {
        collection
          .findOne({'auth.facebook.id': authResponse.userID})
          .then(doc => {
            if (!doc) {
              var err = new Error('User not found');
              err.code = ERR_USER_NOT_FOUND;
              reject(err);
            } else {
              debug('found user: %s', doc._id);
              resolve(doc);
            }
          })
          .catch(reject)
      } else {
        reject(new Error('Invalid authResponse object'));
      }
    });
  }
  
  function createUser(obj) {
    var user = Object.assign({}, obj);
    debug('inserting user:', user);
    return collection.insertOne(user);
  }
  
  createUser.fromFacebook = function(authResponse) {
    return new Promise( (resolve, reject) => {
        if (authResponse && authResponse.userID) {
        
          function updateTokens(user) {
            debug('updating user facebook auth: %s', user._id);

            var find = {'_id': user._id}
              , update = {'$set': {   'auth.facebook.token': authResponse.userID
                                    , 'auth.facebook.expiresIn': authResponse.expiresIn
                                    , 'auth.facebook.updated': new Date()
                                    }
                         }
            return updateUser(find, update)
                      .then(result => {
                        return getUser(user._id);
                      });
          }
        
          getUser.fromFacebook(authResponse)
            .then(updateTokens)
            .then(resolve)
            .catch(err => {
              if (err.code === ERR_USER_NOT_FOUND) {
                var user = {}
                  , facebookAuth = {}
                  ;
                  
                facebookAuth.id = authResponse.userID;
                facebookAuth.token = authResponse.accessToken;
                facebookAuth.expiresIn = authResponse.expiresIn;
                facebookAuth.created = new Date();
                facebookAuth.updated = new Date();
                
                user.auth = {'facebook': facebookAuth};
                
                //TODO: fetch facebook user data.
                createUser(user)
                  .then(result => getUser(result.insertedId))
                  .then(user => { user.isNew = true; resolve(user); })
                  .catch(reject);
              } else {
                reject(err);
              }
            })
        } else {
          reject(new Error('Invalid authResponse object'));
        }
    });
  }
  
  function updateUser(find, update) {
    return collection.updateOne(find, update);
  }
  
	return {
      'get': getUser
    , 'create': createUser
	};
}