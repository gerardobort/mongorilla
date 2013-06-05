
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

        var schema = collection.mongoose.schema || { _id: ObjectId };

        /// add custom relations
        _(collection.relations).each(function (relation, key) {
            var relatedModel = global.getModel(relation.relatedCollection); // this is only for loading purposes
            if ('HasMany' === relation.type) {
                schema[key] = [ { type: ObjectId, ref: relation.relatedCollection } ];
            } else if ('HasOne' === relation.type) {
                schema[key] = { type: ObjectId, ref: relation.relatedCollection };
            }
        });

        var ModelSchema = new Schema(schema);

        ModelSchema.methods = {
        };

        mongoose.model(collectionName, ModelSchema, collectionName);

        return mongoose.model(collectionName);
    }
}
