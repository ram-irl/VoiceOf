var debug = require('debug')('routes:auth')
  , jwt = require('jwt-simple')
  , errors = require('restify').errors
  ;

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
      if (result.key === tok.key)
        resolve(result);
      else
        reject(new Error('Invalid Authentication parameter [code 2]'));
    }
  });
}

var AUTH_MECH = 'VOICEOF-AUTH';

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

function createAuthorizer(app) {

  return function (req, res, next) {
    _authorize(req, app.database)
      .then(function (token) {
        return token;
      })
      .then(function (token) {
        req.token = token;
        next();
      })
      .catch(e => {
        var err = new errors.UnauthorizedError(e, e.message);
        debug(err);
        next(err); 
      });
  };
  
  
}

/**
 * Define routes, on a given router.
 */
module.exports = function (app) {
  // Define /
  var authorizer = createAuthorizer(app);
  
  /*
  app.server.get('/auth', authorizer, function (req, res, next) {
    debug('got req:', req.token);
    res.send([]);
  });*/
  
  var models = app.models;
  
  app.server.put('/auth/facebook', authorizer, function (req, res, next) {
    var token = req.token;
    if (token.type === 'app') {
      // do something with body;
      models
        .users.create.fromFacebook(req.body)
        .then(user => {
          res.setHeader('Location', '/users/' + user._id);
          res.send( user.isNew ? 201 : 200 );
        })
        .catch( e => res.send(new errors.InternalServerError(e, {'message': e.message})) )
    } else {
      next(new errors.UnauthorizedError({'message': 'Invalid Authorization parameter [code 3]'}));
    }
  });

}