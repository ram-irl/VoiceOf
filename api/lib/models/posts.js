var mongo = require('mongodb'),
	ObjectId = mongo.ObjectId,
	_ = require("underscore")._;
	


module.exports = function(db){
	var collection = db.collection("posts");
	
	var model = {};
	
	model.get = function(postId){
		return collection.findOne({_id: ObjectId(postId)});
	};
	model.post = function(post){
		if(!post.content || !post.author || !post.position){
			return Promise.reject("Required Fields Missing");
		}
		post.slug = _.sample("abcdefghijklmnopqrstuvwxyz", 3).join('') + "-" + _.sample("0123456789", 4).join('');
		post.createdOn = new Date();
		return collection.findOne({ slug: post.slug })
		.then(function(data){
			if(!data)
				return collection.insertOne(post);
			else
				return null;
		});
	};
	
	return model;
}



