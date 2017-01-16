// require and instantiate express
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base50 = require('./base50.js');

var Url = require('./models/url');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function(req, res){
//   res.sendFile(path.join(__dirname, 'views/index.html'));
// });

app.post('/api/shortify', function(req, res){
  var theUrl = req.body.url;
  var shortUrl = '';

  Url.findOne({full_url: theUrl}, function(error, doc) {
  	if (doc) {
  		shortUrl = config.webhost + base50.encode(doc._id);

  		res.send({'shortUrl': shortUrl});
  	}else {
  		var newUrl = Url({full_url: theUrl});

  		newUrl.save(function(error) {
  			if (error) {
  				console.log(error);
  			}

  			shortUrl = config.webhost + base50.encode(newUrl._id);

  			res.send({'shortUrl': shortUrl});
  		});
  	}
  });
});

app.get('/:hash_id', function(req, res){
  
  var hash = req.params.hash_id;

  var id = base50.decode(hash);
  
  Url.findOne({_id: id}, function (err, doc) {
  	if (doc) {
      res.send({'full_url': doc.full_url});
  		//res.redirect(doc.full_url);
  	}else {
      res.status(404).send("Link not found!");
  		//res.redirect(config.webhost);
  	}
  });
});

app.get('/api/all', function(req, res){
  Url.find().where("visible", true).exec(function(err, doc) {
    if (doc) {
      res.json(doc);
    }else {
      res.status(404).send("No records found!");
    }
  });
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});