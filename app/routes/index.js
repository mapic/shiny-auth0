var express = require('express');
var passport = require('passport');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var router = express.Router();

var env = process.env;

var debug = true;

// This adds support for the current way to sso
var authenticateWithDefaultPrompt = passport.authenticate('auth0', {});
var authenticateWithPromptNone = passport.authenticate('auth0', {
  prompt: 'none'
});


/* GET home page. */
router.get('/', function(req, res, next) {
  debug && console.log('# GET / -> res.redirect("/secure")');
  res.redirect('/secure/');
});

router.get('/login',
  function (req, res, next) {
    debug && console.log('# GET /login');

    if (env.CHECK_SESSION === 'true' && req.query.sso !== 'false') {
      debug && console.log('# GET /login | authenticateWithPromptNone');

      return authenticateWithPromptNone(req, res, next);
    }
    debug && console.log('# GET /login | authenticateWithDefaultPrompt');
    return authenticateWithDefaultPrompt(req, res, next);
  },
  function (req, res) {
    debug && console.log('# REDIRECT /secure/');

    res.redirect('/secure/');
  });

router.get('/logout', function(req, res){
  var logoutUrl = env.LOGOUT_URL;
  debug && console.log('# GET /logout | env.LOGOUT_URL =', logoutUrl);

  if (env.LOGOUT_AUTH0 === 'true') {
    logoutUrl = 'https://' + env.AUTH0_DOMAIN + '/v2/logout?returnTo=' 
      + env.LOGOUT_URL + '&client_id=' + env.AUTH0_CLIENT_ID
      + (env.LOGOUT_FEDERATED === 'true'? '&federated' : '');
  }
  debug && console.log('# GET /logout | env.LOGOUT_URL =', logoutUrl);
  
  req.logout();
  debug && console.log('# REDIRECT ', logoutUrl);
  res.redirect(logoutUrl);
});

router.get('/callback',
  function (req, res, next) {
    debug && console.log('# GET /callback');
    
    passport.authenticate('auth0', function (err, user, info) {
      debug && console.log('# PASSPORT authenticate "auth0"');
      debug && console.log('user:', user);
      debug && console.log('info:', info);
      debug && console.log('err:', err);


      if (err) {
        next(err);
      }

      if (info === 'login_required') {
      debug && console.log('# login_required, REDIRECT /login?sso=false');
        return res.redirect('/login?sso=false');
      }
      
      if (user) {
        return req.login(user, function (err) {
        debug && console.log('# req.login returned, err:', err);
          if (err) {
            next(err);
          }
          debug && console.log('# res.redirect: req.session.returnTo = ', req.session.returnTo);
          res.redirect(req.session.returnTo || '/secure/');
        });
      }
      next(new Error(info));
    })(req, res, next);
  });

module.exports = router;
