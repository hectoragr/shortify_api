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

app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/all', function(req, res){
  res.sendFile(path.join(__dirname, 'views/all.html'));
});


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
  		res.redirect(doc.full_url);
  	}else {
  		res.redirect(config.webhost);
  	}
  });
});

app.get('/api/all', function(req, res){
  Url.find({}).where("visible", true).select({"_id": 1, "full_url": 1}).exec(function(err, doc) {
    if (doc) {
      json_data = new Array();
      doc.forEach(function(element){
        json_data.push({'_id': element.id, 'full_url': element.full_url, 'shortUrl': config.webhost + base50.encode(element._id), 'concise': element.full_url.substr(0,20) + "..."});
        // element.shortUrl = config.webhost + base50.encode(element._id);
        // element.concise = element.full_url.substr(0,10) + "...";
      });
      console.log(JSON.stringify(json_data, 4, null));
      response = {'data': json_data}
      res.json(response);
    }else {
      res.status(404).send("No records found!");
    }
  });
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});