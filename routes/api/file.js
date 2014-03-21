/*
 * handle api endpoints.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');


exports.get = function (req, res) {
    var objectId = req.route.params.objectId,
        view = req.route.params.view,
        gfs = req.app.get('gfs');

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
}

exports.post = function (req, res) {
    var objectId = req.route.params.objectId,
        fs = require('fs'),
        gfs = req.app.get('gfs');

    var filePromises = [];
    _(req.files).each(function (file, modelPath) {
        var filePromise = new mongoose.Promise();
        fs.exists(file.path, function (exists) {
            if(!exists) {
                filePromise.resolve('tmp file do not exists', null);
                return;
            }

            var readStream = fs.createReadStream(file.path);
            var s3Promise = new mongoose.Promise();

            var collectionName = modelPath.replace(/^([^\.]+)\..*$/, '$1'),
                path = modelPath.replace(/^[^\.]+\.(.*)$/, '$1'),
                collection = _(global.config.collections).find(function (col) {
                    return col.name === collectionName;
                });

            if (!collection) {
                res.status(400);
                res.send({ error: 'bad request' });
                return;
            }


            if (collection.backboneForms.schema[path]
                && collection.backboneForms.schema[path].pushToS3) {
                if (process.env.MONGORILLA_S3_KEY && process.env.MONGORILLA_S3_SECRET) {
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
                            'Content-Length': fs.statSync(file.path).size,
                            'Content-Type': file.type,
                            'x-amz-acl': 'public-read',
                        },
                        function (err, s3res) {
                            console.log('S3 upload completed (' + s3req.url + ').');
                            s3Promise.resolve(null, { url: s3req.url });
                    });
                } else {
                    console.log('WARNING: pushToS3 appears in Config file, but is not setup.');
                }
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
                            collection: collection.name,
                            path: path,
                            s3_url: s3File.url
                        },
                        filename: file.name
                    });
                    var readStream = fs.createReadStream(file.path); // create again
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
}


exports.del = function (req, res) {
    var objectId = req.route.params.objectId,
        gfs = req.app.get('gfs');

    gfs.remove({ _id: ObjectId }, function (err) {
        if (err) {
            res.status(400);
            return res.send(err);
        }
        res.status(200);
        res.send({ ok: true });
    });
}
