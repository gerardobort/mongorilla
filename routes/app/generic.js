/*
 * handle app pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.getAdd = function (req, res) {
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.render('app/add-content.html', {
        title: collection.humanName,
        subtitle: 'Create Content',
        collection: collection,
    });
};

exports.getEdit = function (req, res) {
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        objectId = req.route.params.objectId,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.render('app/edit-content.html', {
        title: collection.humanName,
        subtitle: 'Edit Content',
        collection: collection,
        objectId: objectId,
    });
};

exports.getSearch = function (req, res) {
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.render('app/search-content.html', {
        title: collection.humanName,
        subtitle: 'Search Content',
        collection: collection
    });
};

exports.getPreview = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        objectId = req.route.params.objectId,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    var populateFields = _(collection.relations)
        .map(function (relation, key) { return 'fs.files' !== relation.relatedCollection ? key : ''; })
        .join(' ');
    getModel(collectionName)
        .findOne({ _id: objectId })
        .populate(populateFields)
        .exec()
        .then(function (data) {
            if (collection.previewUrl) {
                var url = collection.previewUrl.replace(/\$\{([^\}]*)\}/g, function (match, path) { return data.get(path); });
                res.redirect(301, url);
            } else {
                res.send('collection.previewUrl is not defined, please add it to your config settings.');
            }
        })
        .reject(function () {
            res.send(arguments);
        });
};
