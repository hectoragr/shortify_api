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
	visible: Boolean
});

urlSchema.pre('save', function (next) {
	var doc = this;
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
});

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;