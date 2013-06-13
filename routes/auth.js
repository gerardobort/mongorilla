
/*
 * handle session statuses - middleware.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

exports.bootstrap = function(req, res, next){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    if (!req.session.user && url_parts.path !== '/') {
        res.redirect('/');
    } else if (req.session.user && url_parts.path === '/') {
        res.redirect('/dashboard');
    }

    res.locals.sessionUser = req.session.user;
    res.locals.host = req.headers.host;
    next();
};

exports.login = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    req.session.user = _(global.config.users).find(function (u) {
        return u.username === req.body.user && u.password === req.body.pass;
    });
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/');
    }
};

exports.logout = function(req, res){
    var url = require('url'),
        url_parts = url.parse(req.url, true),
        _ = require('underscore');

    delete req.session.user;
    res.redirect('/');
};

