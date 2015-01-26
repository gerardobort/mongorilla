/*
 * handle js dynamic assets.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


exports.getModel = function (req, res) {
    var url = require('url'),
        collectionName = req.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore'),
        isRevisionModel = false;

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    if (!collection) {
        collectionName = collectionName.replace(/-revision$/, '');
        var collection = _(global.config.collections).find(function (col) {
            return col.name === collectionName;
        });
        if (!collection) {
            res.status(404);
            res.send({ error: 'Not found' });
            return;
        }
        isRevisionModel = true;
    }

    res.header('Content-Type', 'text/javascript');
    if (isRevisionModel) {
        res.render('js/require-model-revision.js', {
            collection: collection,
            layout: null
        });
    } else {
        res.render('js/require-model.js', {
            collection: collection,
            layout: null
        });
    }
};

exports.getCollection = function (req, res) {
    var url = require('url'),
        collectionName = req.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore'),
        isRevisionModel = false;

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    if (!collection) {
        collectionName = collectionName.replace(/-revision$/, '');
        var collection = _(global.config.collections).find(function (col) {
            return col.name === collectionName;
        });
        if (!collection) {
            res.status(404);
            res.send({ error: 'Not found' });
            return;
        }
        isRevisionModel = true;
    }

    res.header('Content-Type', 'text/javascript');
    if (isRevisionModel) {
        res.render('js/require-collection-revision.js', {
            collection: collection,
            layout: null
        });
    } else {
        res.render('js/require-collection.js', {
            collection: collection,
            layout: null
        });
    }
};

exports.getForm = function (req, res) {
    var url = require('url'),
        collectionName = req.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.header('Content-Type', 'text/javascript');
    res.render('js/require-form.js', {
        collection: collection,
        layout: null
    });
};

exports.getConfig = function (req, res) {
    var url = require('url'),
        collectionName = req.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    if (collection 
        && collection.name 
        && collection.humanName 
        && collection.toStringField
        && collection.backboneForms 
        && collection.backboneForms.schema
        ) {
        res.send(_.extend(
            collection.backboneForms,
            {
                createdField: collection.createdField,
                updatedField: collection.updatedField,
                name: collection.name,
                humanName: collection.humanName,
                toStringField: collection.toStringField
            }
        ));
    } else {
        res.status(404);
        res.send({ error: 'Backbone-Forms Schema Not defined for this collection.' });
    }
};
