var mongo = require('mongodb'), bcrypt = require("bcrypt");

module.exports = function(db){
	return {
		get: function(collection, id){
			console.log(collection, id, new mongo.ObjectId(id));
			return db.collection(collection).findOne({_id: new mongo.ObjectId(id)});
		}/*,
		register: function(collection, obj){
			obj.password = bcrypt.hashSync(obj.password, bcrypt.genSaltSync(10));
			return db.collection(collection).findOne({name: obj.name}).then(function(user){
						
					}).then(function(){
						
					});
		},
		auth: function(collection, obj){
			
		}*/
	};
}