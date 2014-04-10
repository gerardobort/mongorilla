/*
 * generic model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');

require('./file').getModel();

exports.getModel = function (collectionName) {
    var model = mongoose.models[collectionName];

    if (model) {

        return model;

    } else {

        var collection = _(global.config.collections).find(function (col) {
            return col.name === collectionName;
        });

        // _id should not be specified in schema ... http://stackoverflow.com/a/10835032
        var schema = collection.mongoose.schema || { };

        /*
            default types
                String
                Number
                Boolean
                DocumentArray
                Array
                Buffer
                Date
                ObjectId
                Mixed
                Oid
                Object
                Bool
            https://github.com/bnoguchi/mongoose-types
                Email
                Url
        */

        _(collection.backboneForms.schema).each(function (def, key) {
            switch (def.type) {
                default:
                case 'Text':     schema[key] = String; break;
                case 'TextArea': schema[key] = String; break;
                case 'Number':   schema[key] = Number; break;
                case 'Object':   schema[key] = Object; break;
                case 'List':     schema[key] = Array; break;
                case 'Date':     schema[key] = Date; break;
                case 'Datepicker': schema[key] = Date; break;
                case 'DateTime': schema[key] = Date; break;
                case 'File':     schema[key] = 'File'; break;
                case 'Image':    schema[key] = 'File'; break;
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


        schema[collection.createdField.key] = global[collection.createdField.type||'Date'];
        schema[collection.updatedField.key] = global[collection.updatedField.type||'Date'];

        var options = {
            // http://aaronheckmann.tumblr.com/post/48943525537/mongoose-v3-part-1-versioning
            versionKey: '_mongorillaVersion'
        };
        var ModelSchema = new Schema(schema, options);

        ModelSchema.methods = {
        };

        mongoose.model(collectionName, ModelSchema, collectionName);

        // this is only for loading purposes: whitout this the refs may not work
        _(collection.relations).each(function (relation, key) {
            if (!mongoose.models[relation.relatedCollection] && 'fs.files' !== relation.relatedCollection) {
                var relatedModel = exports.getModel(relation.relatedCollection);
            }
        });


        return mongoose.model(collectionName);
    }
}
