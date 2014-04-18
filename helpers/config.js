/*
 * config loader.
 */

var config,
    experimentalConfig,
    _ = require('underscore');

exports.loadConfig = function (configFile) {
    console.log('Loading config file...  ' + configFile);
    config = require('../config/' + (process.env.NODE_ENV||'default') + '.json');
    experimentalConfig = require('../config/experimental.json');

    // add experimental configurations
    _(experimentalConfig.collections).each(function (collection, i) {
        config.collections.push(collection);
    });

    return config;
};
