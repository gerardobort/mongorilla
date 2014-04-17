var _ = require('underscore');


var MongorillaUser = function(data) {

    data.photo_url = data.photo_url || '/images/mock/gorilla-user-1.jpg';

    _.extend(this, {
        _id: data._id,
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        roles: data.roles,
        photo_url: data.photo_url,
        description: data.description,
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
                if (userData.photo && userData.photo.metadata && userData.photo.metadata.s3_url) {
                    userData.photo_url = userData.photo.metadata.s3_url;
                } else if (userData.photo) {
                    userData.photo_url = '/api/fs.files/' + userData.photo._id + '/raw';
                }
                user = new MongorillaUser(userData);
            }
            callback.call(null, user);
        });

};

exports.MongorillaUser = MongorillaUser;
