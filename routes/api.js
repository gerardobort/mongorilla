
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    res.lang = req.lang = 'en' || 'en';
    next();
};

exports.databaseInfo = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');
};

exports.collection = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    // TODO
};

exports.collectionObject = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        objectId = req.route.params.objectId,
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    switch (req.method) {
        case 'GET': 

            if ('default' === objectId) {
                res.send(collection.backboneForms.defaults||{});
            } else {
                var populateFields = _(collection.relations).map(function (obj, key) { return key; }).join(' ');
                global.getModel(collectionName)
                    .findOne({ _id: objectId })
                    //.populate(populateFields)
                    .exec()
                    .then(function (data) {
                        res.send(data);
                    })
                    .reject(function () {
                        res.send(arguments);
                    });
            }
            break;
    }
};

exports.collectionSearch = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        q = (url_parts.query.q||'').sanitize(),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    var findParams = {};

    _(collection.fastSearch.find).each(function (regexStr, key) {
        findParams[key] = new RegExp(regexStr.replace(/:q/g, q), 'i');
    });

    global.getModel(collectionName)
        .find(findParams, collection.fastSearch.columns.join(' '))
        .sort(collection.fastSearch.sort)
        .limit(collection.fastSearch.limit)
        .exec()
        .then(function (results) {
            res.send({
                collectionName: collectionName,
                q: q,
                columns: collection.fastSearch.columns,
                data: results
            });
        });

};
