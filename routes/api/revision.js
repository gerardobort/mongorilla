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
