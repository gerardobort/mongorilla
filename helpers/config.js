/*
 * config loader.
 */

var config,
    experimentalConfig,
    glob = require('glob'),
    _ = require('underscore');

exports.loadConfig = function (configFile) {
    console.log('Loading config file...  ' + configFile);
    config = require('../config/' + (process.env.NODE_ENV||'default') + '.json');
    experimentalConfig = require('../config/experimental.json');

    // Load any schemas in config/schemas into collections object
    var schemas = glob.sync("./config/schemas/**/*.json");
    schemas.forEach(function(filename) {
        if (filename.match(/\.json$/)) {
            var schema = require('../'+filename);
            config.collections.push(schema);
        }
    });

    // add experimental configurations
    _(experimentalConfig.collections).each(function (collection, i) {
        config.collections.push(collection);
    });

    return config;
};
