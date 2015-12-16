function insert(item, user, request) {
    console.log(item);
    var httpRequest = require('request');
    var options = {
        uri: 'https://www.googleapis.com/urlshortener/v1/url',
        method: 'POST',
        json: {
            "longUrl": "http://www.google.com/"
        }
    };
    httpRequest(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.id) // Print the shortened url.
      }
    });
    request.execute();
}