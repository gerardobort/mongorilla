/*
 * revision model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');


exports.getModel = function (collectionName) {
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
            is_draft: { type: Boolean, default: false },
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
                var relatedModel = getModel(relation.relatedCollection);
            }
        });

        return mongoose.model(collectionName + 'Revision');
    }
}

exports.saveRevisionSnapshot = function (collection, objectId, user, callback) {
    getModel(collection.name)
        .findOne({ _id: objectId })
        .populate(_(collection.relations).keys().join(' '))
        .exec(function (err, fullModel) {
            // mongoose hooks doesn't have  support for update, so here is the "hook"
            var RevisionModel = global.getRevisionModel(collection.name);
            var revisionModel = new RevisionModel();
            revisionModel.set({
                objectId: objectId,
                collectionName: collection.name,
                user: user.username,
                created: new Date(),
                is_draft: false,
                modelSnapshot: fullModel.toJSON()
            });
            revisionModel.save(function (err, revision) {
                if (callback) {
                    callback.apply(null, err, revision);
                }
            });
        });
}

exports.saveRevisionSnapshotFromModel = function (collection, objectId, model, user, callback) {
    var RevisionModel = global.getRevisionModel(collection.name);
    var revisionModel = new RevisionModel();
    revisionModel.set({
        objectId: objectId,
        collectionName: collection.name,
        user: user.username,
        created: new Date(),
        is_draft: true,
        modelSnapshot: model.toJSON()
    });
    revisionModel.save(function (err, revision) {
        if (callback) {
            callback.apply(null, [err, revision]);
        }
    });
}
