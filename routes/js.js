
/*
 * handle js dynamic assets.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    res.lang = req.lang = 'en' || 'en';
    next();
};

exports.model = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.header('Content-Type', 'text/javascript');
    res.render('js/require-model.js', {
        collection: collection,
        layout: null
    });
};

exports.form = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
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

exports.config = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    if (collection && collection.backboneForms && collection.backboneForms.schema) {
        res.send(_.extend(
            collection.backboneForms,
            {
                createdField: collection.createdField,
                updatedField: collection.updatedField
            }
        ));
    } else {
        res.status(404);
        res.send({ error: 'Backbone-Forms Schema Not defined for this collection.' });
    }
};

