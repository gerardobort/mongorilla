var _ = require('underscore');


var MongorillaUser = function(data) {

    if (data.photo && data.photo.metadata && data.photo.metadata.s3_url) {
        data.photo_url = data.photo.metadata.s3_url;
    } else if (data.photo) {
        data.photo_url = '/api/fs.files/' + data.photo._id + '/raw';
    } else {
        data.photo_url = '/images/mock/gorilla-user-1.jpg';
    }

    _.extend(this, {
        _id: data._id,
        fullname: data.fullname,
        username: data.username,
        bio: data.bio,
        email: data.email,
        roles: data.roles,
        photo_url: data.photo_url,
        description: data.description,
        created: data.created,
    });

}

MongorillaUser.prototype.hasPermissions = function (mongorillaCollection, crudPermission, specificProperty) {
    // TODO
    return true;
}

MongorillaUser.getFromConfigByAuth = function(user, pass) {

    var userData = _(global.config.users).find(function (u) {
        return u.username === user && u.password === pass;
    });

    return userData ? new MongorillaUser(userData) : null;

};

MongorillaUser.getFromMongoByAuth = function(user, pass, callback) {

    getModel('mongorillaUser')
        .findOne({
            $or: [
                { username: user, password: pass },
                { email: user, password: pass }
            ]
        })
        .populate('photo')
        .exec(function (err, userData) {
            var user;
            if (userData) {
                user = new MongorillaUser(userData);
            }
            callback.call(null, user);
        });

};

MongorillaUser.getFromConfigByUsername = function(username) {

    var userData = _(global.config.users).find(function (u) {
        return u.username === username;
    });

    return userData ? new MongorillaUser(userData) : null;

};

MongorillaUser.getFromMongoByUsername = function(username, callback) {

    getModel('mongorillaUser')
        .findOne({ username: username })
        .populate('photo')
        .exec(function (err, userData) {
            var user;
            if (userData) {
                user = new MongorillaUser(userData);
            }
            callback.call(null, user);
        });

};

exports.MongorillaUser = MongorillaUser;
