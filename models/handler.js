
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


        _(collection.backboneForms.schema).each(function (def, key) {
            switch (def.type) {
                case 'Text':     schema[key] = String; break;
                case 'TextArea': schema[key] = String; break;
                case 'Number':   schema[key] = Number; break;
                case 'Object':   schema[key] = Object; break;
                case 'List':     schema[key] = Array; break;
                // TODO review this
            }
        });

        /// add custom relations
        _(collection.relations).each(function (relation, key) {
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

        // this is only for loading purposes: whitout this the refs may not work
        _(collection.relations).each(function (relation, key) {
            if (!mongoose.models[relation.relatedCollection]) {
                var relatedModel = global.getModel(relation.relatedCollection);
            }
        });

        return mongoose.model(collectionName);
    }
}
