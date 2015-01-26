#!/usr/bin/env node
/**
 * Mongorilla Server.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mongooseWhen = require('mongoose-when'),
    gridfs = require('gridfs-stream'),
    _ = require('underscore'),
    moment = require('moment'),
    authRoute = require('./routes/auth'),
    appMainRoute = require('./routes/app/main'),
    appGenericRoute = require('./routes/app/generic'),
    appJsRoute = require('./routes/app/js'),
    apiGenericRoute = require('./routes/api/generic'),
    apiRevisionRoute = require('./routes/api/revision'),
    apiFileRoute = require('./routes/api/file');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('uinexpress').__express);
app.engine('js', require('uinexpress').__express);
app.set('view engine', 'html');

//DISCOMMENT THIS WHEN YOU PLACE A FAVICON
//app.use(require('serve-favicon')(__dirname + '/public/images/favicon.ico'));

app.use(require('method-override')());
app.use(require('body-parser').urlencoded({
    extended: true,
    limit: '30mb'
}));
app.use(require('body-parser').json({
    limit: '30mb'
}));
app.use(require('multer')({
    dest: './uploads/',
    limits: {
        fileSize: 30 * 1024 * 1024
    }
}));
app.use(require('cookie-parser')('mongorilla cookie secret'));
app.use(require('morgan')('dev'));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: true,
    secret: 'mongorilla session secret'
}));
// static files have higher priority over server routers
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('compression')({
    threshold: 512
}));

// development only
if ('development' == app.get('env')) {
    app.use(require('errorhandler')());
} else {
    process.on('uncaughtException', function () {
        console.log('Fatal:', arguments);
    });
}

global.config = require('./helpers/config').loadConfig();

// mongo
var dbConnString = process.env.MONGORILLA_MONGO_URL || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL;
try {
    console.log('Connecting to ' + dbConnString.replace(/^.*@/, '') + ' ...');
    app.set('db', mongoose.connect(dbConnString, { db: { safe: true }}));
    app.set('gfs', gridfs(app.get('db').connections[0].db, mongoose.mongo));
} catch (err) {
    console.log(
        'Impossible to connect to MongoDB.\n\n'
        + 'Make sure you have defined MONGO_URL or MONGORILLA_MONGO_URL env vars.');
    return;
}

// models
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
    if (file.match(/\.js$/)) {
        require(models_path+'/'+file);
    }
});

// inlcude helpers module
require('./helpers/string');
global.helpers = require('./helpers/crappy');
global.moment = moment; // date formatting library
global.getModel = require('./models/generic').getModel;
global.getRevisionModel = require('./models/revision').getModel;

// preload all the models set in the config file
config.collections.forEach(function (collection) {
    getModel(collection.name);
});

// yet experimental
var MongorillaCollection = require('./models/helpers/collection').MongorillaCollection;
MongorillaCollection.getAllFromMongo(function (collections) {
    _(collections).each(function (collection) {
        global.config.collections.push(collection);
        getModel(collection.name);
    });
});

// expose config to the app local context
app.use(function(req, res, next){
    for(key in global.config){
        app.locals[key] = global.config[key];
    }
    next();
});

// frontend
app.get('/', authRoute.bootstrap, appMainRoute.getIndex);
app.get('/auth/login', authRoute.bootstrap, authRoute.getLogin);
app.post('/auth/login', authRoute.postLogin);
app.post('/auth/logout', authRoute.postLogout);
app.get('/dashboard', authRoute.bootstrap, appMainRoute.getDashboard);
app.get('/user/:username', authRoute.bootstrap, appMainRoute.getUserProfile);
app.get('/add/:collectionName', authRoute.bootstrap, appGenericRoute.getAdd);
app.get('/search/:collectionName', authRoute.bootstrap, appGenericRoute.getSearch);
app.get('/edit/:collectionName/:objectId', authRoute.bootstrap, appGenericRoute.getEdit);
app.get('/preview/:collectionName/:objectId', authRoute.bootstrap, appGenericRoute.getPreview);

// dynamic javascript assets
app.get('/models/:collectionName.js', authRoute.bootstrap, appJsRoute.getModel);
app.get('/collections/:collectionName.js', authRoute.bootstrap, appJsRoute.getCollection);
app.get('/forms/:collectionName.base.js', authRoute.bootstrap, appJsRoute.getForm);
app.get('/forms/:collectionName.js', authRoute.bootstrap, appJsRoute.getForm);
app.get('/config/:collectionName.json', authRoute.bootstrap, appJsRoute.getConfig);

// api gridfs interface
app.post('/api/fs.files', authRoute.bootstrap, apiFileRoute.post);
app.get('/api/fs.files/:objectId', authRoute.bootstrap, apiFileRoute.get);
app.get('/api/fs.files/:objectId/:view', authRoute.bootstrap, apiFileRoute.get);
app.delete('/api/fs.files/:objectId', authRoute.bootstrap, apiFileRoute.del);

// api revision
app.get('/api/revision', authRoute.bootstrap, apiRevisionRoute.getList);
app.get('/api/:collectionName/:objectId/revisions', authRoute.bootstrap, apiRevisionRoute.getLatestList);
app.post('/api/:collectionName/:objectId/revisions', authRoute.bootstrap, apiRevisionRoute.post);
app.delete('/api/:collectionName/:objectId/revisions/:revisionId', authRoute.bootstrap, apiRevisionRoute.del);

// api generic
app.get('/api/search/:collectionName', authRoute.bootstrap, apiGenericRoute.getSearch);
app.get('/api/:collectionName', authRoute.bootstrap, apiGenericRoute.getList);
app.post('/api/:collectionName', authRoute.bootstrap, apiGenericRoute.post);
app.get('/api/:collectionName/:objectId', authRoute.bootstrap, apiGenericRoute.get);
app.put('/api/:collectionName/:objectId', authRoute.bootstrap, apiGenericRoute.put);
app.delete('/api/:collectionName/:objectId', authRoute.bootstrap, apiGenericRoute.del);

// frontend optimization
global.frontendBuilt = false;
fs.exists('./public/init-build.js', function (exsists) {
    global.frontendBuilt = exsists;
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Mongorilla server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
