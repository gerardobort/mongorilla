/*
 * handle app pages.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.getIndex = function(req, res){
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

exports.getDashboard = function (req, res) {
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collectionsStatsPromises = _(global.config.collections).map(function (col) {
        var colStatPromise = new mongoose.Promise();
        var sort = {};
        sort[col.updatedField.key] = -1;
        sort[col.createdField.key] = -1;
        mongoose.Promise.when(
            getModel(col.name, [col.toStringField, col.updatedField].join(' ')).find({}).count().exec(),
            getModel(col.name, [col.toStringField, col.updatedField].join(' ')).find({ }).sort(sort).limit(5).exec()
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
