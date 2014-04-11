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

    req.session.user = _(global.config.users).find(function (u) {
        return u.username === req.body.user && u.password === req.body.pass;
    });
    if (req.session.user) {
        if (req.xhr) {
            res.send({
                user: {
                    fullname: req.session.user.fullname, 
                    username: req.session.user.username 
                },
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

exports.postLogout = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true);

    delete req.session.user;
    res.redirect('/');
};
