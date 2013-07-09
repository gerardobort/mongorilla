
/*
 * config lib.
 */

var fs = require('fs'),
    _ = require('underscore'),
    config = null;

exports.loadConfig = function (configFile, callback) {
    console.log('Loading config file...  ' + configFile);
    fs.readFile(configFile, 'utf8', function (err, str) {
        config = JSON.parse(str);
        callback(config);
    });
};
