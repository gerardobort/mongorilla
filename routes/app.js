
/*
 * handle app pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.index = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    if (req.session.user) {
        res.redirect('/dashboard');
        return;
    }
    res.render('app/index.html', {
        title: 'welcome'
    });
};

exports.dashboard = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collectionsStatsPromises = _(global.config.collections).map(function (col) {
        var colStatPromise = new mongoose.Promise();
        var sort = {};
        sort[col.updatedField.key] = -1;
        sort[col.createdField.key] = -1;
        mongoose.Promise.when(
            global.getModel(col.name, [col.toStringField, col.updatedField].join(' ')).find({}).count().exec(),
            global.getModel(col.name, [col.toStringField, col.updatedField].join(' ')).find({ }).sort(sort).limit(5).exec()
        ).addBack(function (err, colTotalCount, colLastCreated) {
            colStatPromise.resolve(null, {
                collection: col,
                colTotalCount: colTotalCount,
                colLastCreated: colLastCreated
            });
        });
        return colStatPromise;
    });

    mongoose.Promise.when.apply(null, collectionsStatsPromises)
        .addBack(function (err) {
            var args = _(arguments).map(function (o) { return o; });
            res.render('app/dashboard.html', {
                title: 'Dashboard',
                colsStats: args.slice(1)
            });
        });
};

exports.addContent = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.render('app/add-content.html', {
        title: 'edit',
        collection: collection,
        includeFormsAssets: true
    });
};

exports.searchContent = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.render('app/search-content.html', {
        title: 'edit',
        collection: collection
    });
};

exports.editContent = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        objectId = req.route.params.objectId,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    res.render('app/edit-content.html', {
        title: 'edit',
        collection: collection,
        objectId: objectId,
        includeFormsAssets: true
    });
};

exports.previewContent = function(req, res){
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
    global.getModel(collectionName)
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
