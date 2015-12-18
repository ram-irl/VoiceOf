/***********************************************************************
 * Authorization Module.
 * Provides middleware for processing Authorization header in a request.
 *
 **********************************************************************/

/**
 * VARIABLES
 */
var debug = require('debug')('middleware:authorize')
  , jwt = require('jwt-simple')
  , errors = require('restify').errors
  ;
  
/**
 * CONSTANTS
 */
const AUTH_MECH = 'VOICEOF-AUTH';

/**
 * FUNCTIONS UTILITY
 */
  
function decode(payload, secret) {
  return new Promise( (resolve, reject) => {
    var result = undefined;
    try {
      result = jwt.decode(payload, secret);
    } catch(e) {
      result = undefined;
      reject(e);
    }
    
    if (result) {
      resolve(result);
    }
  });
}

function decodeToken(tok) {
  return new Promise( (resolve, reject) => {
    var result = undefined;
    try {
      result = jwt.decode(tok.token, tok.secret);
    } catch(e) {
      result = undefined;
      reject(e);
    }
    
    if (result) {
      if (result.key === tok.key) {
        result.requestToken = function() { return tok };
        resolve(result);
      } else
        reject(new Error('Invalid Authentication parameter [code 2]'));
    }
  });
}



function removeQuotes(str) {
  var result = '';
  
  if (str && typeof str === 'string' && str.length > 0) {
  
    if (str[0] === '"')
      result = str.substr(1)
    
    if (result[result.length - 1] === '"')
      result = result.slice(0, -1);
  }

  return result;
}

function parseAuthHeader(header) {
  return new Promise( (resolve, reject) => {
    if (header && typeof header === 'string' && header.length) {
      if (header.indexOf(AUTH_MECH + ' ') === 0) {
        var data = header.substring( (AUTH_MECH + ' ').length );
        if (data.length) {
          var params = data.split(',');
          var token = params.reduce( (prev, current) => {
            if (current && current.length > 0) {
              var pair = current.split('=',2);
              if (pair.length === 2) {
                prev[pair[0].trim().toLowerCase()] = removeQuotes(pair[1].trim());
              }
            }
            return prev;
          }, {});
          
          resolve(token);
          return;
        }
      }
        
      reject(new Error('Invalid Authorization header'));
    } else {
      reject(new Error('Missing Authorization header'));
    }
  })
}

function fetchSecret(database, token) {
  return new Promise( (resolve, reject) => {
    if (token && token.appid && token.token) {
      database
        .then(db => {
          var apps = db.collection('apps');
          return apps.findOne({'app_id': token.appid})
                      .then(doc => {
                        if (!doc)
                          return Promise.reject(new Error('Invalid Authorization parameter [code 1]'))
                        
                        var t = Object.assign({}, token);
                        t.secret = doc.secret;
                        t.key = doc.key;
                        resolve(t);
                      });
        })
        .catch(e => reject(new errors.GatewayTimeoutError({'message': e.message})));
    } else
      reject(new Error('Invalid Authorization token'));

  });
}

function validateToken(token) {
  return Promise.resolve(token);
}

function _authorize(req, database) {
  return new Promise( (resolve, reject) => {
    var headerAuth = (req && req.headers && req.headers.authorization ? req.headers.authorization : null);
    if (!headerAuth) {
      reject(new Error('Missing Authorization header'));
    } else {
      parseAuthHeader(headerAuth)
        .then(fetchSecret.bind(null, database))
        .then(decodeToken)
        .then(validateToken)
        .then(resolve)
        .catch(reject);
   }
  });
}

function validateSessionToken(token, database) {
  return new Promise( (resolve, reject) => {
    database
      .then(db => {
        resolve(token);
      })
      .catch(reject);
  });
}

/***********************************************************************
 * EXPORTS
 **********************************************************************/

/**
 * Creates a middleware function to process the Authentication header, 
 * on every request.
 * If authentication is successful, then `req.token` will be available
 * to any defined routes.
 *
 */
var middleware = module.exports = function create(app) {

  return function (req, res, next) {
    _authorize(req, app.database)
      .then(function (token) {
        return token;
      })
      .then(function (token) {
        req.token = token;
        
        if (token.type === 'session') {
          return validateSessionToken(token, app.database)
            .then(token => undefined)
            .then(next);
        } else {
          next();
        }
      })
      .catch(e => {
        var err = new errors.UnauthorizedError(e, e.message);
        debug(err);
        next(err); 
      });
  };
}


middleware.sessionToken = function () {
  return Promise.reject(new Error('Not implemented'));
}

/**
 * Converts an APP_TOKEN to a SESSION_TOKEN
 *
 */
middleware.sessionToken.fromAppToken = function (appToken) {
  return function (user) {
    var userId = user._id
      , sessionToken = {'isNew': user.isNew}
      ;
    
    return new Promise( (resolve, reject) => {
      var token = Object.assign({}, appToken, {'type': 'session', 'userId': userId})
        , secret = appToken.requestToken().secret
        , strToken = ''
        ;
      try {
        strToken = jwt.encode(token, secret);
      } catch(e) {
        reject(e);
      }
      
      if (strToken) {
        Object.assign(sessionToken, token);
        sessionToken.toString = function() { return strToken; }
        sessionToken.toJSON = function() { return JSON.stringify({'token': strToken}); }
        resolve(sessionToken);
      }
    });
  }
}

/**
 * Middleware route to accept only APP_TOKEN
 *
 */
middleware.isApp = function (req, res, next) {
  if (rek.token && req.token.type === 'app') {
    next();
  } else {
    res.send(new errors.UnauthorizedError({'message': 'Invalid Authorization parameter [code 3:1]'}));
  }
}

/**
 * Middleware route to accept only SESSION_TOKEN
 *
 */
middleware.isSession = function (req, res, next) {
  if (rek.token && req.token.type === 'session') {
    next();
  } else {
    res.send(new errors.UnauthorizedError({'message': 'Invalid Authorization parameter [code 3:2]'}));
  }
}