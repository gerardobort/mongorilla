var _ = require('underscore'),
    MongorillaUser = require('./user').MongorillaUser;


var MongorillaCollection = function(data) {

    _.extend(this, {
            name: '',
            humanName: '',
            backboneForms: {
                schema: {
                }
            },
            mongoose: {
                schema: {
                }
            },
            createdField: { key: '' } ,
            updatedField: { key: '' }
        }, data);

}

MongorillaCollection.prototype.isSessionUserAllowedToRoute = function(req, res) {
    var  ops = { GET: 'r', POST: 'c', PUT: 'u', DELETE: 'd' };
    if (!res.locals.sessionUser.hasPermissions(this, ops[req.method])) {
        res.status(403);
        res.send({
            error: res.locals.sessionUser.username + ' has no enough permissions for perform this operation'
        });
        return false;
    }
    return true;
};


MongorillaCollection.getByName = function(name) {

    var collectionData = _(global.config.collections).find(function (col) {
        return col.name === name;
    });

    return collectionData ? new MongorillaCollection(collectionData) : null;

};

MongorillaCollection.getByRouterParams = function(req, res) {

    var collectionName = req.route.params.collectionName,
        collection =  MongorillaCollection.getByName(collectionName);

    if (!collection) {
        res.status(400);
        res.send({ error: 'bad request', details: 'Collection not found: MongorillaUser.getByRouterParams' });
        return;
    }

    return collection;
};

MongorillaCollection.getFrom__ = function(name, callback) {

    getModel('mongorillaCollection')
        .findOne({
            name: name
        })
        .exec(function (err, collectionData) {
            var collection;
            if (collectionData) {
                collection = new MongorillaUser(collectionData);
            }
            callback.call(null, collection);
        });

};

MongorillaCollection.createFromPostPayload = function(payload) {

    var attributes = _.clone(payload);

    _(collection.relations).each(function (data, relKey) {
        if (_.isArray(payload[relKey]) && payload[relKey].length) {
            attributes[relKey] = _(payload[relKey]).map(function (val, key) {
                if ('string' === typeof val ) {
                    return val;
                }
                return val['_id'] ? val['_id'].toString() : '';
            });
            if (0 === attributes[relKey].length) {
                delete attributes[relKey];
            }
        } else if (_.isObject(payload[relKey]) && payload[relKey]['_id']) {
            attributes[relKey] = payload[relKey]['_id'].toString();
        }
    });

    return new MongorillaCollection(attributes);

};


MongorillaCollection.createFromMongo = function(doc) {

    return new MongorillaCollection(doc);

};

MongorillaCollection.getAllFromMongo = function(callback) {

    getModel('mongorillaCollection')
        .findOne({})
        .exec(function (err, collections) {
            if (!collections) {
                return [];
            }
            callback.call(null, _(collections).map(MongorillaCollection.createFromMongo));
        });

};

exports.MongorillaCollection = MongorillaCollection;
