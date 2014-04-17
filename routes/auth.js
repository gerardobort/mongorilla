/*
 * handle session statuses - middleware.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore'),
    MongorillaUser = require('../models/helpers/user').MongorillaUser;

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

    res.locals.sessionUser = req.session.user ? new MongorillaUser(req.session.user) : null;
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
        url_parts = url.parse(req.url, true),
        MongorillaUser = require('../models/helpers/user').MongorillaUser;

    var callback = function (mongorillaUser) {
        if (mongorillaUser) {
            req.session.user = mongorillaUser;
            if (req.xhr) {
                res.send({
                    user: mongorillaUser,
                    ok: true
                });
            } else {
                res.redirect('/dashboard');
            }
        } else {
            res.status(403);
            res.send({ ok: false });
        }
    };

    if (!(mongorillaUser = MongorillaUser.getFromConfigByAuth(req.body.user, req.body.pass))) {
        MongorillaUser.getFromMongoByAuth(req.body.user, req.body.pass, callback);
    } else {
        callback.call(null, mongorillaUser);
    }
};

exports.postLogout = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true);

    delete req.session.user;
    res.redirect('/');
};
