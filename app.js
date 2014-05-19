
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');

//imagemagick and graphics treatment library
var im = require('imagemagick');

//database handling module
var mongoose = require('mongoose');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var flash = require('connect-flash');

var userDetails = require('./models/user');

require('./config/passport')(passport); // pass passport for configuration

var app = express();

mongoose.connect('mongodb://localhost/pajti');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser()); // read cookies (needed for auth)
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());

// required for passport
app.use(express.session({ secret: 'ilovepizzaaaaaaaaa' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// Since this is the last non-error-handling
// middleware use()d, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('errors/article404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
require('./routes')(app, passport);

/*
	SERIALIZE AND DESERIALIZE USER
*/
passport.serializeUser(function(user, done) {
	done(null, user);
});
 
passport.deserializeUser(function(user, done) {
	done(null, user);
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   
    process.nextTick(function () {
	  userDetails.findOne({'username':username},
		function(err, user) {
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			if (user.password != password) { return done(null, false); }
			return done(null, user);
		});
    });
  }
));


/*
	LAUNCH THE SERVER AND DO BOOM BOOM
*/
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
