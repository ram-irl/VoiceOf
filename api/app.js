/**
 * Create a Restify reference
 */
var Server = require('./lib/server')
  , startServer = Server.start
  , debug = require('debug')('app')
  , router = require('./lib/router')
  , Database = require('./lib/database')
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
  , router( server )
      .then( startServer(process.env.VOICEOF_HTTP_PORT) ) // start Server
      .catch( error => debug('Error installing routes', error) )
]).then(app => debug('App started'))
  .catch( error => debug('Error starting app', error) )