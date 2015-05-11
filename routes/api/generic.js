/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore'),
    MongorillaCollection = require('../../models/helpers/collection').MongorillaCollection;


exports.get = function (req, res) {
    var objectId = req.params.objectId,
        collection = MongorillaCollection.getByRouterParams(req, res);

    if (!collection || !collection.isSessionUserAllowedToRoute(req, res)) {
        return;
    }

    if ('default' === objectId) {
        res.send(collection.backboneForms.defaults||{});
    } else {
        getModel(collection.name)
            .findOne({ _id: objectId })
            .populate(_(collection.relations).keys().join(' '))
            .exec()
            .then(function (data) {
                res.send(data);
            })
            .reject(function () {
                res.send(arguments);
            });
    }
};

exports.post = function (req, res) {
    var objectId = req.params.objectId,
        collection = MongorillaCollection.getByRouterParams(req, res),
        url = require('url'),
        url_parts = url.parse(req.url, true),
        description = url_parts.query.description || '';

    if (!collection || !collection.isSessionUserAllowedToRoute(req, res)) {
        return;
    }

    var attributes = JSON.parse(JSON.stringify(req.body));
    var responseData = JSON.parse(JSON.stringify(attributes));

    delete attributes['_id'];

    var model = new getModel(collection.name)();
    model.set(attributes);
    model.set(collection.createdField.key, new global[collection.createdField.type||'Date']());
    model.set(collection.updatedField.key, new global[collection.createdField.type||'Date']());
    model.save(function (err, model) {
        if (err) {
            res.send(err);
        } else {
            var responseData = model.toObject();
            delete responseData.__v;

            if (collection.revisionable) {
                require('../../models/revision').saveRevisionSnapshot(collection, model._id, description, req.session.user, true, function (err, revision) {
                    res.send(responseData);
                });
            } else {
                res.send(responseData);
            }
        }
    });
};

exports.put = function (req, res) {
    var objectId = req.params.objectId,
        collection = MongorillaCollection.getByRouterParams(req, res),
        url = require('url'),
        url_parts = url.parse(req.url, true),
        description = url_parts.query.description || '';

    if (!collection || !collection.isSessionUserAllowedToRoute(req, res)) {
        return;
    }

    var attributes = JSON.parse(JSON.stringify(req.body));
    var responseData = JSON.parse(JSON.stringify(attributes));

    delete attributes['_id'];

    // TODO skip all attributes not specified in schema
    //var attributesToSet = global.helpers.toFlat(attributes);
    var attributesToSet = global.helpers.deepClone(attributes);
    attributesToSet[collection.updatedField.key] = new global[collection.createdField.type||'Date']().toISOString();


    // @see https://github.com/LearnBoost/mongoose/issues/964
    getModel(collection.name)
        .findById(objectId, function (err, model) {
            if (err) {
                res.send(err);
            } else {
                model.update({
                    $set: attributesToSet
                }, function (err) {
                    if (err) {
                        res.send(err);
                    } else if (collection.revisionable) {
                        require('../../models/revision').saveRevisionSnapshot(collection, objectId, description, req.session.user, false, function (err, revision) {
                            res.send(responseData);
                        });
                    } else {
                        res.send(responseData);
                    }
                });
            }
        });

};

exports.del = function (req, res) {
    var objectId = req.params.objectId,
        collection = MongorillaCollection.getByRouterParams(req, res);

    if (!collection || !collection.isSessionUserAllowedToRoute(req, res)) {
        return;
    }

    // TODO ACL for this
    getModel(collection.name)
        .findByIdAndRemove(objectId, function (err, model) {
            if (err) {
                res.send(err);
            } else {
                res.send(model);
            }
        });
};

exports.getSearch = function (req, res) {
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        q = (url_parts.query.q||'').sanitize().makeSafeForRegex(),
        p = parseInt(url_parts.query.p||1, 10),
        collection = MongorillaCollection.getByRouterParams(req, res);

    if (!collection || !collection.isSessionUserAllowedToRoute(req, res)) {
        return;
    }

    var columnsHumanNames = _(collection.fastSearch.columns).map(function (col) {
        if (collection.backboneForms.schema[col]) {
            return collection.backboneForms.schema[col].title || col;
        }
        return col;
    });

    var findParams = global.helpers.toJS(global.helpers.deepClone(collection.fastSearch.find), function (arg) {
        return arg.replace(/\$\{q\}/g, q);
    });

    p = p < 1 ? 1 : p;
    var ipp = collection.fastSearch.limit || 10;

    var findKeys = {};
    _(['_id', collection.toStringField, 'type'].concat(collection.fastSearch.columns)).each(function (c) { findKeys[c] = true; });

    getModel(collection.name)
        .collection
        .find(
            findParams,
            findKeys,
            {
                skip: (p -1) * ipp,
                limit: ipp,
                sort: collection.fastSearch.sort,
            }, function (err, cursor) {
                cursor.count(false, function (err, total) {
                    var populatePromises = [];
                    cursor.toArray(function (err, data) {
                        _(data).each(function (modelData) {
                            // type gives compat with mongoose-schema-extend module
                            var MongoosePopulateModel = mongoose.models[modelData.type] || getModel(collection.name);
                            var populatePromise = new mongoose.Promise();
                            MongoosePopulateModel
                                .findOne({ _id: modelData._id }, findKeys)
                                .populate(collection.fastSearch.populate || '')
                                .exec(function (err, model) {
                                    if (!err && !model) {
                                        populatePromise.resolve(null, modelData);
                                    } else {
                                        populatePromise.resolve(err, model);
                                    }
                                });
                            populatePromises.push(populatePromise);
                        });
                        mongoose.Promise
                            .when.apply(null, populatePromises)
                            .addBack(function () {
                                var data = _.toArray(arguments).slice(1);
                                // replace populated docs with their respective toStringFields
                                data.forEach(function (model, i) { 
                                    if (model && !model.toObject) { // treat those that weren't able to get found by populate
                                        return true;
                                    }
                                    var result = model.toObject();
                                    _(collection.fastSearch.columns).each(function (prop, i) {
                                        if (model.get(prop)){
                                            if (collection.relations && collection.relations[prop]) {
                                                var relatedCollection = MongorillaCollection.getByName(collection.relations[prop].relatedCollection);
                                                if (collection.relations[prop].type == "HasOne") {
                                                    result[prop] = model.get(prop).get(relatedCollection.toStringField);
                                                } else if (collection.relations[prop].type == "HasMany") {
                                                    result[prop] = (model.get(prop) || []).map(function(item) { return item.get(relatedCollection.toStringField); });
                                                }
                                            }
                                        }
                                    });
                                    result = _(result).pick(['_id'].concat(collection.fastSearch.columns)); // clean up deep objects, and left only dot written props
                                    data[i] = result;
                                });
                                res.send({
                                    collectionName: collection.name,
                                    q: q,
                                    p: p,
                                    ipp: ipp,
                                    count: data.length,
                                    total_count: total,
                                    total_pages: Math.ceil(total/(ipp||1)),
                                    columns: collection.fastSearch.columns,
                                    columnsHumanNames: columnsHumanNames,
                                    data: _.isArray(data[0]) ? [] : data
                                });
                            });
                    });
                });
            });
};

exports.getList = function (req, res) {
    var pager = require('../../helpers/pager'),
        collection = MongorillaCollection.getByRouterParams(req, res);

    if (!collection || !collection.isSessionUserAllowedToRoute(req, res)) {
        return;
    }

    var router = new pager.GetListRouter(req, res, getModel(collection.name), {
        populate: _(collection.relations).keys()
    });
    router.send();
};
