
/*
 * generic model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');

exports.getModel = function (collectionName) {
    var model = mongoose.models[collectionName];

    if (model) {

        return model;

    } else {

        var collection = _(global.config.collections).find(function (col) {
            return col.name === collectionName;
        });

        var ModelSchema = new Schema(
            collection.mongoose.schema || { _id: ObjectId }
        );

        ModelSchema.methods = {
        };

        mongoose.model(collectionName, ModelSchema, collectionName);

        return mongoose.model(collectionName);
    }
}
