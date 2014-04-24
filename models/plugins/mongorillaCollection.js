module.exports = function (schema, options) {
  
    schema.pre('save', function (next) {
        var mongoose = require('mongoose');
        var _ = require('underscore');
        var MongorillaCollection = require('../helpers/collection').MongorillaCollection;
        var collection = MongorillaCollection.createFromMongo(this);

        // update global config
        var configCollection = _(global.config.collections).find(function (configCollection) {
            return configCollection.name === collection.name;
        });
        global.config.collections[ global.config.collections.indexOf(configCollection) ] = collection;
    
        // update mongoose model
        delete mongoose.models[collection.name];
        getModel(collection.name);

        console.log('generic model ' + this.humanName + ' is now updated!');
        next();
    });
  
}
