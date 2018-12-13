var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var dotenv = require('dotenv')
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');


var debug = true;

dotenv.load();

var routes = require('./routes/index');
var secure = require('./routes/secure');
var editor = require('./routes/editor');
var logs   = require('./routes/logs');

// Default everything to false
process.env.CHECK_SESSION = process.env.CHECK_SESSION || 'false';
process.env.LOGOUT_AUTH0 = process.env.LOGOUT_AUTH0 || 'false';
process.env.LOGOUT_FEDERATED = process.env.FEDERATED || 'false';

if (process.env.LOGOUT_FEDERATED === 'true') {
  process.env.LOGOUT_AUTH0 = 'true';
}

// This will configure Passport to use Auth0
var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN, // ngi-shiny.eu.auth0.com
    clientID:     process.env.AUTH0_CLIENT_ID, // 
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    state: false,
    callbackURL:  process.env.AUTH0_CALLBACK_URL // https://cloud.ngi.no/callback
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    debug && console.log('# Auth0Strategy returned | accessToken, refreshToken, extraParams, profile', accessToken, refreshToken, extraParams, profile)
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  });

passport.use(strategy);

// you can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  debug && console.log('serializeUser');
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  debug && console.log('deserializeUser');
  done(null, user);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(cookieParser());
var COOKIE_SECRET = require('crypto').randomBytes(64).toString('hex');
debug && console.log('COOKIE_SECRET = ', COOKIE_SECRET);
app.use(session({
  // secret: process.env.COOKIE_SECRET,
  secret: COOKIE_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : { 
    maxAge: (1 * 60 * 1000),
    // maxAge: (1000),
    // secure : true
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/secure/', secure);
app.use('/editor/', editor);
app.use('/logs/', logs);
app.use('/', routes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  debug && console.log('catch 404, app.use()');
  debug && console.trace('trace');

  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    debug && console.log('dev error handler', err);
    res.status(err.status || 500);
    var msg = req.query.error_description;
    console.log('msg:', msg);
    debug && console.log('req.query', req.query);

    // not verified email
    if (msg == '417') {
      console.log('# ')
      // return res.redirect('/login');
      return res.render('verifyEmail', {
        message: 'Please verify your email...',
        error: {}
      });

    }

    // all other errors
    res.render('error', {
      message: msg,
      error: {}
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  debug && console.log('prod error handler', err);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
