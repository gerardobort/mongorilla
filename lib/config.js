
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
        // TODO add config JSON validation

        // checks if the collection uses Aloha, this is only for lazy loading - optimization
        _(config.collections).each(function (collection, i) {
            collection.requiresAloha = !!JSON.stringify(collection).match('"type":"Aloha"');
        });
        callback(config);
    });
};
