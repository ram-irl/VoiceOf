var model = {};
var dbUrl = "mongodb://voiceof-dev:S9tEV7LCuFUqEzWmYy5AnCWonADA9Qi_Ly1SvWC_2tA-@ds054118.mongolab.com:54118/voiceof-dev";

require('mongodb').MongoClient.connect(dbUrl).then(function(db){
	model.db = db;
	model.users = require("./users")(model.db);
	console.log(model.users);
	var getr = model.users.get("users", "566fbf9bbf78870f74438a84");
	console.log(getr);
	getr.then(function(data){
		console.log("SUCC");
		console.log(data);
	}, function(err){
		console.log("ERR");
		console.log(err);
	});
}, function(err){
	console.log("CONN ERR");
	console.log(err);
});

module.exports = model;