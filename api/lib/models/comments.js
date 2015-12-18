var mongo = require('mongodb'),
	ObjectId = mongo.ObjectId
	, _ = require('underscore')._;


module.exports = function(db){

	var collection = db.collection("comments");

	var model = {};

	model.getOne = function(commentId){
		return collection.findOne({_id:ObjectId(commentId)});
	};

	model.getAll = function(postId){
		return new Promise((resolve, reject) => {
			collection.find({post:ObjectId(postId)}).toArray(function(err, comments){
				var userIds = _.pluck(comments, "owner");
				db.collection("users").find({ "_id": {
					$in: userIds
				} }).project({ "_id": 1, "name": 1, "picture": 1 }).toArray(function(err, users){
					_.map(comments, function(comment){
						comment.owner = _.find(users, function(user){ return (user._id.toString() === comment.owner.toString()) });
						return comment;
					});
					resolve(comments);
				});
				if(err)
					return reject(err);
			});
		});
	};

	model.add = function(comment){
		var commentObj = Object.assign({},comment);

		if(!commentObj.content || !commentObj.owner	|| !commentObj.post)
		{
			return Promise.reject("Required fields missing");
		}

		commentObj.owner = ObjectId(commentObj.owner);
		commentObj.post = ObjectId(commentObj.post);
		commentObj.createdOn = new Date();

		return collection.insertOne(commentObj);
	};

	return model;
}
