var moment = require('moment')
    , crypto = require('crypto');

var getExpiryTime = function () {
    var _date = new Date((new Date()).getTime() + 100*60000);
    return moment.utc(_date).toISOString();
};


module.exports = function (app) {
  app.server.get("/s3/policy", function(req, res, next){
    var mode = 'public-read';
    var date = new Date();
    var config =
    {
    	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    	region: process.env.AWS_REGION,
    	bucket: process.env.AWS_BUCKET
    };
    var s3Policy = {
    	'expiration': getExpiryTime(),
    	'conditions': [
    		['starts-with', '$key', req.query.folder],
    		{ 'bucket': config.bucket },
    		{ 'acl': mode },
    		['starts-with', '$Content-Type', req.query.type],
    		{ 'success_action_status': '201' }
    	]
    };

    // stringify and encode the policy
    var stringPolicy = JSON.stringify(s3Policy);
    var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

    // sign the base64 encoded policy
    var signature = crypto.createHmac('sha1', config.secretAccessKey)
    					.update(new Buffer(base64Policy, 'utf-8')).digest('base64');

    // build the results object
    var s3Credentials = {
    	s3Policy: base64Policy,
    	s3Signature: signature,
    	AWSAccessKeyId: config.accessKeyId
    };

    res.send(200, s3Credentials);
  });
}
