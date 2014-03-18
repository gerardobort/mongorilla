
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

    if (!collection) {
        res.status(400);
        res.send({ error: 'bad request' });
        return;
    }

    var ops = { GET: 'r', POST: 'c', PUT: 'u', DELETE: 'd' };
    if (!global.helpers.hasPermission(req.session.user, collectionName, ops[req.method])) {
        res.status(403);
        res.send({ error: req.session.user.name + ' has no enough permissions for perform this operation' });
        return;
    }

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
            var view = req.route.params.view;
            if ('raw' === view) {
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
                        res.status(404);
                        res.send('file not found');
                    }
                } else {
                    res.status(404);
                    res.send('file not found');
                }
            } else {
                gfs.collection('fs')
                    .findOne({ _id: new mongoose.mongo.ObjectID(objectId) }, function (err, data) {
                        res.send(data);
                    });
            }
            break;
        case 'POST':
            var filePromises = [];
            _(req.files).each(function (file, modelPath) {
                var filePromise = new mongoose.Promise();
                require('fs').exists(file.path, function (exists) {
                    if(!exists) {
                        filePromise.resolve('tmp file do not exists', null);
                        return;
                    }
                    var collectionName = modelPath.replace(/^([^\.]+)\..*$/, '$1'),
                        path = modelPath.replace(/^[^\.]+\.(.*)$/, '$1'),
                        collection = _(global.config.collections).find(function (col) {
                            return col.name === collectionName;
                        });

                    var readStream = require('fs').createReadStream(file.path);
                    var s3Promise = new mongoose.Promise();
                    if (collection
                        && collection.backboneForms.schema[path]
                        && collection.backboneForms.schema[path].pushToS3) {
                        res.setTimeout(30*60*1000); // extend server response tiemout
                        var s3Client = require('knox').createClient({
                            key: process.env.MONGORILLA_S3_KEY,
                            secret: process.env.MONGORILLA_S3_SECRET,
                            bucket: config.s3.bucket,
                        });
                        console.log('Starting S3 upload...');
                        var s3req = s3Client.putStream(
                            readStream,
                            modelPath + '-' + file.name,
                            {
                                'Content-Length': require('fs').statSync(file.path).size,
                                //'Content-Type': file.type,
                                'x-amz-acl': 'public-read',
                            },
                            function (err, s3res) {
                                console.log('S3 upload completed (' + s3req.url + ').');
                                s3Promise.resolve(null, { url: s3req.url });
                        });
                    } else {
                        console.log('No S3 upload required.');
                        s3Promise.resolve(null, { url: null });
                    }
                    mongoose.Promise
                        .when(s3Promise)
                        .addBack(function (err, s3File) {
                            console.log('Writting file on GridFS...');
                            var writestream = gfs.createWriteStream({
                                metadata: {
                                    collection: collectionName,
                                    path: path,
                                    s3_url: s3File.url
                                },
                                filename: file.name
                            });
                            var readStream = require('fs').createReadStream(file.path); // create again
                            readStream.pipe(writestream);
                            writestream.on('close', function (file) {
                                console.log('GridFS write complete.');
                                filePromise.resolve(null, file);
                            });
                        });
                });
                filePromises.push(filePromise);
            });
            mongoose.Promise
                .when.apply(null, filePromises)
                .addBack(function (err) {
                    if (err) {
                        res.status(409);
                        res.send({ error: err });
                    } else {
                        var files = _(arguments).toArray().slice(1);
                        res.send({ data: files });
                    }
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
