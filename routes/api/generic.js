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

function checkAcl(req, res) {
    var collectionName = req.route.params.collectionName;

    var ops = { GET: 'r', POST: 'c', PUT: 'u', DELETE: 'd' };
    if (!global.helpers.hasPermission(req.session.user, collectionName, ops[req.method])) {
        res.status(403);
        res.send({ error: req.session.user.name + ' has no enough permissions for perform this operation' });
        return false;
    }

    return true;
};

exports.get = function (req, res) {
    var objectId = req.route.params.objectId,
        collection = getCollection(req, res);

    if (!collection) {
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
    var objectId = req.route.params.objectId,
        collection = getCollection(req, res),
        url = require('url'),
        url_parts = url.parse(req.url, true),
        description = url_parts.query.description || '';

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
    var objectId = req.route.params.objectId,
        collection = getCollection(req, res),
        url = require('url'),
        url_parts = url.parse(req.url, true),
        description = url_parts.query.description || '';

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
    attributesToSet[collection.updatedField.key] = new global[collection.createdField.type||'Date']().toISOString();


    getModel(collection.name)
        .findByIdAndUpdate(objectId, { $set: attributesToSet }, function (err, model) {
            if (err) {
                res.send(err);
            } else {
                if (collection.revisionable) {
                    require('../../models/revision').saveRevisionSnapshot(collection, objectId, description, req.session.user, false, function (err, revision) {
                        res.send(responseData);
                    });
                } else {
                    res.send(responseData);
                }
            }
        });

};

exports.del = function (req, res) {
    var objectId = req.route.params.objectId,
        collection = getCollection(req, res);

    if (!collection) {
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
        collection = getCollection(req, res);

    if (!collection) {
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

    getModel(collection.name)
        .find(findParams, collection.fastSearch.columns.join(' ') + ' ' + collection.toStringField)
        .sort(collection.fastSearch.sort)
        .limit(collection.fastSearch.limit)
        .exec()
        .then(function (results) {
            res.send({
                collectionName: collection.name,
                q: q,
                columns: collection.fastSearch.columns,
                columnsHumanNames: columnsHumanNames,
                data: results
            });
        });
};

exports.getList = function (req, res) {
    var pager = require('../../helpers/pager'),
        collection = getCollection(req, res);

    if (!collection) {
        return;
    }

    var router = new pager.GetListRouter(req, res, getModel(collection.name), {
        populate: _(collection.relations).keys()
    });
    router.send();
};
