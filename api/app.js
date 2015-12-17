/**
 * Create a Restify reference
 */
var Server = require('./lib/server')
  , startServer = Server.start
  , debug = require('debug')('app')
  , router = require('./lib/router')
  , routes = require('./lib/routes')
  , Database = require('./lib/database')
  , App = require('./lib/app')
  ;

/**
 * Create a server instance.
 */
var server = new Server({
  //certificate: fs.readFileSync('/code/calicom/voiceof/etc/certs/voiceof.crt'),
  //key: fs.readFileSync('/code/calicom/voiceof/etc/certs/voiceof.key'),
  name: 'VoiceOf',
});

var database = new Database(process.env.MONGOLAB_URI);

/**
 * Install routes on app.
 */
Promise.all([
    database
      .connect()
  , //router( server )
    App.create(server, database)
      .then( routes.install )
      .then( app => startServer(process.env.PORT || 3030)(app.server) ) // start Server
      .catch( err => debug('Error starting the server', err) )
]).then(app => debug('App started'))
  .catch( err => debug('Error starting app', err) )