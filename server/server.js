// Set up
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');

// Configuration
// mongoose.connect('mongodb://localhost/reviewking');

//Mongo DB Connectoin
//mongodb
// mongoose.connect('mongodb://localhost/take12');
// process.env.MONGODB_URI will only be defined if you
// are running on Heroku
if(process.env.MONGODB_URI != undefined) {
    // use the string value of the environment variable
    var dbLocation = 'mlab';
    var uri = process.env.MONGODB_URI;
    mongoose.Promise = global.Promise;

    var promise = mongoose.connect(uri, {
    useMongoClient: true,
  /* other options */
});

} else {
    // use the local database server
    var dbLocation = 'local';
    console.log('local DB')
    mongoose.Promise = global.Promise;
    var uri = 'mongodb://localhost/reviewKing';
    var promise = mongoose.connect(uri, {
    useMongoClient: true,
    });
}
promise.then(function(db) {
console.log('db connected to reviewKing');
db.on('error', console.error.bind(console, 'connection error'));
db.once('openUri', function() {
  console.log('Connected to reviewKing', dbLocation);
});

});

//mongoose end function

app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

// Models
var Review = mongoose.model('Review', {
    title: String,
    description: String,
    rating: Number
});

// Routes

    // Get reviews
    app.get('/api/reviews', function(req, res) {

        console.log("fetching reviews");

        // use mongoose to get all reviews in the database
        Review.find(function(err, reviews) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(reviews); // return all reviews in JSON format
        });
    });

    // create review and send back all reviews after creation
    app.post('/api/reviews', function(req, res) {

        console.log("creating review");

        // create a review, information comes from request from Ionic
        Review.create({
            title : req.body.title,
            description : req.body.description,
            rating: req.body.rating,
            done : false
        }, function(err, review) {
            if (err)
                res.send(err);

            // get and return all the reviews after you create another
            Review.find(function(err, reviews) {
                if (err)
                    res.send(err)
                res.json(reviews);
            });
        });

    });

    // delete a review
    app.delete('/api/reviews/:review_id', function(req, res) {
        Review.remove({
            _id : req.params.review_id
        }, function(err, review) {

        });
    });


// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");
