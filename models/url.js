var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterSchema = Schema({
	_id: {type: String, required: true},
	last: {type: Number, default: 0}
});

var counter = mongoose.model('counter', CounterSchema);

var urlSchema = new Schema({
	_id: {type: Number, index: true},
	full_url: String,
	created_at: Date,
	visible: Boolean,
	last_hit: Date,
	custom_code: String
});

var hitSchema = new Schema({
	url_id: Number,
	created_at: Date
});

var hit = mongoose.model('hit', hitSchema);

urlSchema.pre('save', function (next) {
	var doc = this;
	var query = doc.custom_code == ""?{}:{'custom_code': doc.custom_code};

	if (typeof doc.custom_code === 'undefined' || doc.custom_code == "") {
		counter.findByIdAndUpdate({_id: 'last_id'}, {$inc: {last: 1}}, function(error, counter) {
			console.log(error);
			if (error){
				return next(error);
			}
			doc.created_at = new Date();
			doc._id = counter.last;
			doc.visible = true;
			console.log(doc);
			next();
		});
	}else {
		Url.find(query, function (err, doc2) {
			if (!doc2.length) {
				counter.findByIdAndUpdate({_id: 'last_id'}, {$inc: {last: 1}}, function(error, counter) {
					console.log(error);
					if (error){
						return next(error);
					}
					doc.created_at = new Date();
					doc._id = counter.last;
					doc.visible = true;
					console.log(doc);
					next();
				});
			}else {
				console.log("Code taken!: " + doc.custom_code);
				return next(new Error("Code taken!"));
			}
		});
	}
});

urlSchema.pre('hit', function(next){
	var doc = this;
	newHit = new hit({url_id: doc._id, created_at: new Date()});
	newHit.save(function(err){
		if (err){
			return next(err);
		}
		next();
	});
});

hitSchema.pre('save', function(next){
	var doc = this;
	doc.created_at = new Date();
	next();
});

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;
//module.exports = hit;