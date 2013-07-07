
/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


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
                var populateFields = _(collection.relations)
                    .map(function (relation, key) { return 'fs.files' !== relation.relatedCollection ? key : ''; })
                    .join(' ');
                global.getModel(collectionName)
                    .findOne({ _id: objectId })
                    .populate(populateFields)
                    .exec()
                    .then(function (data) {
                        res.send(data);
                    })
                    .reject(function () {
                        res.send(arguments);
                    });
            }
            break;
        case 'POST':

            var attributes = _.clone(req.body);
            _(collection.relations).each(function (data, relKey) {
                if (_.isArray(req.body[relKey]) && req.body[relKey].length) {
                    attributes[relKey] = _(req.body[relKey]).map(function (val, key) {
                        if ('string' === typeof val ) {
                            return val;
                        }
                        return val['_id'].toString();
                    });
                    if (0 === attributes[relKey].length) {
                        delete attributes[relKey];
                    }
                } else if (_.isObject(req.body[relKey]) && req.body[relKey]['_id']) {
                    attributes[relKey] = req.body[relKey]['_id'].toString();
                }
            });
            var responseData = _.clone(attributes);
            delete attributes['_id'];
            // TODO skip all attributes not specified in schema
            var attributesToSet = global.helpers.toFlat(attributes);

            var model = new global.getModel(collectionName)();
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
                        // mongoose hooks doesn't have  support for update, so here is the "hook"
                        var RevisionModel = global.getRevisionModel(collectionName);
                        var revisionModel = new RevisionModel();
                        revisionModel.set({
                            objectId: model.get('_id'),
                            collectionName: collectionName,
                            user: req.session.user.username,
                            created: new Date(),
                            modelSnapshot: model
                        });
                        revisionModel.save();
                    }

                    res.send(responseData);
                }
            });

            break;
        case 'PUT':

            var attributes = _.clone(req.body);
            _(collection.relations).each(function (data, relKey) {
                if (_.isArray(req.body[relKey]) && req.body[relKey].length) {
                    attributes[relKey] = _(req.body[relKey]).map(function (val, key) {
                        if ('string' === typeof val ) {
                            return val;
                        }
                        return val['_id'].toString();
                    });
                    if (0 === attributes[relKey].length) {
                        delete attributes[relKey];
                    }
                } else if (_.isObject(req.body[relKey]) && req.body[relKey]['_id']) {
                    attributes[relKey] = req.body[relKey]['_id'].toString();
                }
            });
            var responseData = _.clone(attributes);
            delete attributes['_id'];
            // TODO skip all attributes not specified in schema
            var attributesToSet = global.helpers.toFlat(attributes);
            attributesToSet[collection.updatedField.key] = new global[collection.createdField.type||'Date']().toISOString();

            global.getModel(collectionName)
                .findByIdAndUpdate(objectId, { $set: attributesToSet }, function (err, model) {
                    if (err) {
                        res.send(err);
                    } else {

                        if (collection.revisionable) {
                            // mongoose hooks doesn't have  support for update, so here is the "hook"
                            var RevisionModel = global.getRevisionModel(collectionName);
                            var revisionModel = new RevisionModel();
                            revisionModel.set({
                                objectId: model.get('_id'),
                                collectionName: collectionName,
                                user: req.session.user.username,
                                created: new Date(),
                                modelSnapshot: model
                            });
                            revisionModel.save();
                        }

                        res.send(responseData);
                    }
                });

            break;
        case 'DELETE':

            global.getModel(collectionName)
                .findByIdAndRemove(objectId, function (err, model) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(model);
                    }
                });

            break;
    }
};

exports.collectionSearch = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        url_parts = url.parse(req.url, true),
        q = (url_parts.query.q||'').sanitize().makeSafeForRegex(),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    var columnsHumanNames = _(collection.fastSearch.columns).map(function (col) {
        if (collection.backboneForms.schema[col]) {
            return collection.backboneForms.schema[col].title || col;
        }
        return col;
    });


    var findParams = global.helpers.toJS(_(collection.fastSearch.find).clone(), function (arg) {
        return arg.replace(/\$\{q\}/g, q);
    });

    global.getModel(collectionName)
        .find(findParams, collection.fastSearch.columns.join(' ') + ' ' + collection.toStringField)
        .sort(collection.fastSearch.sort)
        .limit(collection.fastSearch.limit)
        .exec()
        .then(function (results) {
            res.send({
                collectionName: collectionName,
                q: q,
                columns: collection.fastSearch.columns,
                columnsHumanNames: columnsHumanNames,
                data: results
            });
        });

};




exports.fileObject = function(req, res){
    var url = require('url'),
        objectId = req.route.params.objectId,
        gfs = req.app.get('gfs'),
        _ = require('underscore');

    switch (req.method) {
        case 'GET': 
            var readStream = gfs.createReadStream({ _id: objectId });
            if (readStream) {
                try {
                    readStream.on('end', function() {
                        res.send();
                    })
                    .on('error', function() {
                        res.send();
                    })
                    .pipe(res);
                } catch (error) {
                    res.send('file not found');
                }
            } else {
                    res.send('file not found');
            }
            break;
        case 'POST':
            _(req.files).each(function (file) {
                require('fs').exists(file.path, function (exists) {
                    if(!exists) {
                        res.send({ error: 'Ah crap! Something bad happened' });
                        return;
                    }
                    var writestream = gfs.createWriteStream({
                        filename: file.name
                    });
                    require('fs').createReadStream(file.path).pipe(writestream);
                    res.send({ _id: writestream.id, url: '/api/file/' + writestream.id });
                });
            });
            break;
        case 'PUT':
            break;
        case 'DELETE':
            gfs.remove({ _id: ObjectId }, function (err) {
                if (err) {
                    res.status(400);
                    return res.send(err);
                }
                res.status(200);
                res.send({ ok: true });
            });
            break;
    }
};

exports.revisions = function(req, res){
    var url = require('url'),
        collectionName = req.route.params.collectionName,
        objectId = req.route.params.objectId,
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    var collection = _(global.config.collections).find(function (col) {
        return col.name === collectionName;
    });

    global.getRevisionModel(collectionName)
        .find({ objectId: objectId })
        .sort({ created: -1 })
        .exec()
        .then(function (data) {
            res.send(data);
        })
        .reject(function () {
            res.send(arguments);
        });
};
