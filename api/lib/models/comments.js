var mongo = require('mongodb'),
	ObjectId = mongo.ObjectId;


module.exports = function(db){
	
	var collection = db.collection("comments");
	
	var model = {};
	
	model.getOne = function(commentId){
		return collection.findOne({_id:ObjectId(commentId)});
	};

	model.getAll = function(postId){
		return collection.find({postId:ObjectId(postId)});
	};


	model.add = function(comment){
		var commentObj = Object.assign({},comment);

		if(!commentObj.content || !commentObj.owner	|| !commentObj.post)
		{
			return Promise.reject("Required fields missing");
		}

		return collection.insertOne(commentObj);
	};

	return model;
}



