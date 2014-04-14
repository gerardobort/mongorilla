/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');


function getCollection(req, res) {
    var collectionName = req.route.params.collectionName;

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    if (!collection) {
        res.status(400);
        res.send({ error: 'bad request' });
        return;
    }

    return collection;
};


exports.getList = function (req, res) {
    var pager = require('../../helpers/pager');
    var router = new pager.GetListRouter(req, res, getRevisionModel(), { fields: {
        objectId: 1,
        collectionName: 1,
        user: 1,
        created: 1,
        is_draft: 1,
        first_revision: 1
    } });
    router.send();
};


exports.getLatestList = function(req, res){
    var objectId = req.route.params.objectId,
        collection = getCollection(req, res);

    if (!collection) {
        return;
    }

    global.getRevisionModel(collection.name)
        .find({ objectId: objectId })
        .sort({ created: -1 })
        .limit(15)
        .exec()
        .then(function (data) {
            res.send(data);
        })
        .reject(function () {
            res.send(arguments);
        });
};

exports.post = function (req, res) {
    var objectId = req.route.params.objectId,
        collection = getCollection(req, res);

    if (!collection) {
        return;
    }

    var revisionAttributes = _.clone(req.body);
    var modelAttributes = revisionAttributes.snapshot;
    var responseData = _.clone(revisionAttributes);

    if ('object' !== typeof modelAttributes) {
        res.status(400);
        res.send({ error: 'bad request', details: 'missing snapshot subdocument' });
        return;
    }

    _(collection.relations).each(function (data, relKey) {
        if (_.isArray(req.body.snapshot[relKey]) && req.body.snapshot[relKey].length) {
            modelAttributes[relKey] = _(req.body.snapshot[relKey]).map(function (val, key) {
                if ('string' === typeof val ) {
                    return val;
                }
                return val['_id'] ? val['_id'].toString() : '';
            });
            if (0 === modelAttributes[relKey].length) {
                delete modelAttributes[relKey];
            }
        } else if (_.isObject(req.body.snapshot[relKey]) && req.body.snapshot[relKey]['_id']) {
            modelAttributes[relKey] = req.body.snapshot[relKey]['_id'].toString();
        }
    });

    delete modelAttributes['_id'];

    // TODO skip all attributes not specified in schema
    var attributesToSet = global.helpers.toFlat(modelAttributes);

    var model = new getModel(collection.name)();
    model.set({ _id: objectId });
    model.set(attributesToSet);
    model.set(collection.createdField.key, new global[collection.createdField.type||'Date']());
    model.set(collection.updatedField.key, new global[collection.createdField.type||'Date']());

    if (collection.revisionable) {
        require('../../models/revision').saveRevisionSnapshotFromModel(collection, model._id, model, revisionAttributes.description, req.session.user, function (err, revision) {
            if (err) {
                res.status(501);
                res.send(err);
            } else {
                res.send(revision.toJSON());
            }
        });
    } else {
        res.status(400);
        res.send({ error: 'bad request', details: 'collection not revisionable' });
        return;
    }
};

exports.del = function (req, res) {
    var objectId = req.route.params.objectId,
        revisionId = req.route.params.revisionId,
        collection = getCollection(req, res);

    if (!collection) {
        return;
    }

    global.getRevisionModel(collection.name)
        .findByIdAndRemove(revisionId, function (err, model) {
            if (err) {
                res.send(err);
            } else {
                res.send(model);
            }
        });
};
