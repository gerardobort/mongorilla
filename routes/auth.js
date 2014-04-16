/*
 * handle session statuses - middleware.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');

exports.bootstrap = function(req, res, next){
    var url = require('url'),
        url_parts = url.parse(req.url, true);

    if (!req.session.user && url_parts.path !== '/' && !url_parts.path.match(/^\/auth\/login/)) {
        res.redirect('/auth/login');
        return;
    } else if (req.session.user && url_parts.path === '/') {
        res.redirect('/dashboard');
        return;
    }

    res.locals.sessionUser = req.session.user;
    res.locals.host = req.headers.host;
    next();
};

exports.getLogin = function(req, res){
    var showGuestLoginButton = _(global.config.users).find(function (u) {
        return u.username === 'guest';
    });
    res.render('auth/login.html', {
        title: 'Sign-in',
        showGuestLoginButton: showGuestLoginButton
    });
};

exports.postLogin = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true);

    var sessionUser = _(global.config.users).find(function (u) {
        return u.username === req.body.user && u.password === req.body.pass;
    });

    var userPromise = new mongoose.Promise();
    if (sessionUser) {
        userPromise.resolve(null, sessionUser);
    } else {
        getModel('mongorillaUser')
            .findOne({
                $or: [
                    { username: req.body.user, password: req.body.pass },
                    { email: req.body.user, password: req.body.pass }
                ]
            })
            .populate('photo')
            .exec()
            .then(function (sessionUser) {
                userPromise.resolve(null, sessionUser);
            })
            .reject(function () {
                userPromise.resolve(null, null);
            });
    }

    mongoose.Promise.when(userPromise).addBack(function (err, sessionUserData) {
        var sessionUser = _.clone(sessionUserData);

        if (sessionUser.photo && sessionUser.photo.metadata && sessionUser.photo.metadata.s3_url) {
            sessionUser.photo_url = sessionUser.photo.metadata.s3_url;
        } else if (sessionUser.photo) {
            sessionUser.photo_url = '/api/fs.files/' + sessionUser.photo._id + '/raw';
        } else {
            sessionUser.photo_url = '/images/mock/gorilla-user-1.jpg';
        }
        delete sessionUser.password;

        req.session.user = _.extend({}, {
            _id: sessionUser._id,
            fullname: sessionUser.fullname,
            username: sessionUser.username,
            email: sessionUser.email,
            roles: sessionUser.roles,
            photo_url: sessionUser.photo_url,
        });

        if (req.session.user) {
            if (req.xhr) {
                res.send({
                    user: req.session.user,
                    ok: true
                });
            } else {
                res.redirect('/dashboard');
            }
        } else {
            res.status(403);
            res.send({ ok: false });
        }
    });
};

exports.postLogout = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true);

    delete req.session.user;
    res.redirect('/');
};
