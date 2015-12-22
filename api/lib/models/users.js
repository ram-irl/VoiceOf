/***********************************************************************
 * MODEL `users`
 * Provides the Users model to handle user db reference operations.
 **********************************************************************/
 

/**
 * VARIABLES
 */
var debug = require('debug')('models:users')    // DEBUG
  , mongo = require('mongodb')                  // MongoDB
  , ObjectId = mongo.ObjectId                   // ObjectId for MongoDB
  , FB = require('fb')                          // Facebook API module
  ;
  

/**
 * CONSTANTS
 */
const ERR_USER_NOT_FOUND = 101;


/**
 * Query the Facebook API for details of the user we have the token for.
 *
 * @param   String  token   The Facebook `accessToken` for an user.
 * @return  Promise         Returns a promise that will result with an 
 *                          Object containing the requested user details
 */
function getFacebookUser(token) {
  return new Promise( (resolve, reject) => {
    FB.api('me', {
        fields:         'id,name,picture,birthday,email,location,name_format',
        limit:          250,
        access_token:   token
    }, function (result) {
      if(!result || result.error) {
        reject(result.error || new Error('No result'));
      } else {
        resolve(result);
      }
    });
  });
}

/**
 *  Create an Users module, for a given Database reference.
 *
 * @param   Object  db    A Database reference object.
 * @return  Object        The Users model object
 */
module.exports = function(db){
  var model = {}; // Initialize the `model` object
  
  var collection = db.collection('users'); // Collection reference.

  /**
   * Fetch an user document from the database, based on a given ID.
   * @param {String|ObjectId}   id  The ID of the user document.
   * @return  Promise               A promise that will resolve with a user document.
   */
  function getUser(id) {
    return collection.findOne({'_id': ObjectId(id)});
  }
  
  /**
   * Fetch an user document from the database, based on Facebook
   * authentication response.
   *
   * @param   Object  authResponse    The `authResponse` object, received from Facebook when a user logs in.
   * @return  Promise                 A promise that will resolve with a user document.
   */
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

  /**
   * Create a new user document in the database.
   * See mongodb Collection.insertOne.
   *
   * @param   Object  obj     Object with fields for the user document.
   * @return  Promise
   */
  function createUser(obj) {
    var user = Object.assign({}, obj);
    debug('inserting user:', user);
    return collection.insertOne(user);
  }
  
  /**
   * Create a new user document in the database, based on an
   * `authResponse` received from Facebook login/authentication.
   *
   * @param   Object  authResponse    The `authResponse` object, received from Facebook when a user logs in.
   * @return  Promise                 A promise that will resolve with a user document.
   */
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
                
                getFacebookUser(authResponse.accessToken)
                  .then(fbUser => {
                    debug('Received facebook user data:', fbUser);
                    if (fbUser.name)
                      user.name = fbUser.name;
                    
                    if (fbUser.birthday)
                      user.birthday = new Date(fbUser.birthday);
                    
                    if (fbUser.email)
                      user.email = fbUser.email;
                    
                    if (fbUser.picture && fbUser.picture.data)
                      user.picture = fbUser.picture.data.url;
                    
                    return user;
                  })
                  .then(createUser)
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
  
  /**
   * Create a new user document in the database.
   * See mongodb Collection.updateOne()
   *
   * @param   Object  find    Object with fields to query on.
   * @param   Object  update  Object that defines the update actions to be performed.
   * @return  Promise
   */
  function updateUser(find, update) {
    return collection.updateOne(find, update);
  }
  
	/**
   * Exports model methods
   */
  model.get     = getUser;          // exports `model.get`
  model.create  = createUser;       // exports `model.create`
  model.update  = updateUser;       // exports `model.update`
   
  // Returns `model`. 
  return model;
}