/*
 * config loader.
 */

var fs = require('fs'),
    _ = require('underscore'),
    config = null;

exports.loadConfig = function (configFile) {
    console.log('Loading config file...  ' + configFile);
    config = require('../config/' + (process.env.NODE_ENV||'default') + '.json');

    // checks if the collection uses Aloha, this is only for lazy loading - optimization
    _(config.collections).each(function (collection, i) {
        collection.requiresAloha = !!JSON.stringify(collection).match('"type":"Aloha"');
    });

    return config;
};
