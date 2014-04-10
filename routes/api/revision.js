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

exports.get = function(req, res){
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

    var attributes = _.clone(req.body);
    var responseData = _.clone(attributes);

    _(collection.relations).each(function (data, relKey) {
        if (_.isArray(req.body[relKey]) && req.body[relKey].length) {
            attributes[relKey] = _(req.body[relKey]).map(function (val, key) {
                if ('string' === typeof val ) {
                    return val;
                }
                return val['_id'] ? val['_id'].toString() : '';
            });
            if (0 === attributes[relKey].length) {
                delete attributes[relKey];
            }
        } else if (_.isObject(req.body[relKey]) && req.body[relKey]['_id']) {
            attributes[relKey] = req.body[relKey]['_id'].toString();
        }
    });

    delete attributes['_id'];

    // TODO skip all attributes not specified in schema
    var attributesToSet = global.helpers.toFlat(attributes);

    var model = new getModel(collection.name)();
    model.set(attributesToSet);
    model.set(collection.createdField.key, new global[collection.createdField.type||'Date']());
    model.set(collection.updatedField.key, new global[collection.createdField.type||'Date']());

    if (collection.revisionable) {
        require('../../models/revision').saveRevisionSnapshotFromModel(collection, model._id, model, req.session.user, function (err, revision) {
            res.send(responseData);
        });
    } else {
        res.status(400);
        res.send({ error: 'bad request', details: 'collection not revisionable' });
        return;
    }
};
