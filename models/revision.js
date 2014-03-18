
/*
 * generic model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');

exports.getRevisionModel = function (collectionName) {
    var model = mongoose.models[collectionName + 'Revision'];

    if (model) {

        return model;

    } else {

        var collection = _(global.config.collections).find(function (col) {
            return col.name === collectionName;
        });

        // _id should not be specified in schema ... http://stackoverflow.com/a/10835032
        var schema = {
            objectId: { type: ObjectId, ref: collectionName },
            collectionName: String,
            user: String,
            created: Date,
            modelSnapshot: Schema.Types.Mixed
        };

        var options = {
            // http://aaronheckmann.tumblr.com/post/48943525537/mongoose-v3-part-1-versioning
            versionKey: '_mongorillaVersion'
        };
        var ModelSchema = new Schema(schema, options);

        ModelSchema.methods = {
        };


        mongoose.model(collectionName + 'Revision', ModelSchema, 'mongorillaRevision');

        // this is only for loading purposes: whitout this the refs may not work
        _(collection.relations).each(function (relation, key) {
            if (!mongoose.models[relation.relatedCollection] && 'fs.files' !== relation.relatedCollection) {
                var relatedModel = global.getModel(relation.relatedCollection);
            }
        });

        return mongoose.model(collectionName + 'Revision');
    }
}
