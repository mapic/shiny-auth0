var express = require('express');
var passport = require('passport');
var httpProxy = require('http-proxy');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn()
var router = express.Router();
var fs = require('fs');
var async = require('async');

/* Proxy all requests */
router.all(/.*/, ensureLoggedIn, function(req, res, next) {

  // log folder
  var log_folder = '../logs/';

  // log json
  var log_json = {
    title : 'Shiny Server Log File',
    log_time : new Date(),
    apps : {}
  };

  // read log folder
  fs.readdir(log_folder, function (err, files) {

    // read each log file
    async.eachSeries(files, function (f, callback) {
      fs.readFile(log_folder + f, function (err, content) {

        // append log content
        var content_array = content.toString().split('\n');
        log_json.apps[f] = content_array;
        callback(err);
      });
    }, function (err) {

      if (err) return res.send('Error fetching logs. Please contact sysadmin.');

      // return log data to client
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify(log_json, null, 4));
    });
  });

});

module.exports = router;
