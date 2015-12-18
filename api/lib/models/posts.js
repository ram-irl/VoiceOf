var mongo = require('mongodb')
	, ObjectId = mongo.ObjectId
	, _ = require("underscore")._
	;

module.exports = function(db){
	var collection = db.collection("posts");

	var model = {};

	model.createSlug = function(tries){

		var slug = _.sample("abcdefghijklmnopqrstuvwxyz", 3).join('') + "-" + _.sample("0123456789", 4).join('');
		return new Promise((resolve, reject) => {
			collection.findOne({slug: slug}).then(function(doc){
				if(!doc) resolve(slug);
				else if(_.isUndefined(tries)) model.createSlug(1).then(resolve, reject);
				else if(tries === 5) reject("Iteration Count Exceeded");
				else model.createSlug(++tries).then(resolve, reject);
			});
		});
	};

	model.get = function(postId){
		return collection.findOne({_id: ObjectId(postId)});
	};

	model.create = function(postObj){
		var post = Object.assign({}, postObj);
		if(!post.content || !post.author || !post.position){
			return Promise.reject(new Error("Required Fields Missing"));
		}
		post.createdOn = new Date();
		return model.createSlug()
		.then(slug => {
			post.slug = slug;
			console.log("IN SLUG");
			return post;
		})
		.then(post => collection.insertOne(post));
	};

	model.search = function(location, radius){
		if(!_.isNumber(location.lng) || !_.isNumber(location.lat) || !_.isNumber(radius)){
			console.log("FAILED");
			return Promise.reject(new Error("Invalid Fields"));
		}
		return new Promise((resolve, reject) => {
			collection.aggregate([{
				$geoNear: {
					near: {
						type: "Point",
						coordinates: [parseFloat(location.lng), parseFloat(location.lat)]
					},
					distanceField: "distance",
					maxDistance: radius,
					spherical: true,
				}
			},{
				$sort: { distance: -1 }
			}]).toArray(function(err, result){
				console.log(err, result);
				if(err)
					return reject(err);
				resolve(result);
			});
		});
	};

	return model;
}
