/**
 * Module dependencies.
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
    appRoute = require('./routes/app'),
    jsRoute = require('./routes/js'),
    apiRoute = require('./routes/api');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('uinexpress').__express);
app.engine('js', require('uinexpress').__express);
app.set('view engine', 'html')
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.limit('30mb'));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var configFile = process.env.NODE_ENV ? 
    './config/' + process.env.NODE_ENV + '.json'
    : './config/default.json';

require('./lib/config').loadConfig(configFile, function (config) {
    global.config = config;

    // mongo and models
    var dbConnString = config.mongo.url || process.env.MONGORILLA_MONGO_URL;
    try {
        console.log('Connecting to ' + dbConnString.replace(/^.*@/, '') + ' ...');
        app.set('db', mongoose.connect(dbConnString, { db: { safe: true }}));
        // this sucks
        app.set('gfs', gridfs(app.get('db').connections[0].db, mongoose.mongo));
    } catch (err) {
        console.log(
            'Impossible to connect to MongoDB.\n\n'
            + 'Make sure you have defined MONGO_URL or MONGORILLA_MONGO_URL env vars.');
        return;
    }

    var models_path = __dirname + '/models'
    fs.readdirSync(models_path).forEach(function (file) {
        if (file.match(/\.js$/)) {
            require(models_path+'/'+file);
        }
    });

    // inlcude helpers module
    global.helpers = require('./lib/helpers');
    global.moment = moment; // date formatting library
    global.getModel = require('./models/generic').getModel;
    global.getRevisionModel = require('./models/revision').getModel;

    // preload all the models set in the config file
    global.config.collections.forEach(function (collection) {
        var model = getModel(collection.name);
    });


    // routes
    app.get('/', authRoute.bootstrap, appRoute.index);

    app.post('/user/login', authRoute.login);
    app.get('/user/logout', authRoute.logout);

    app.get('/dashboard', authRoute.bootstrap, appRoute.dashboard);
    app.get('/add/:collectionName', authRoute.bootstrap, appRoute.addContent);
    app.get('/search/:collectionName', authRoute.bootstrap, appRoute.searchContent);
    app.get('/edit/:collectionName/:objectId', authRoute.bootstrap, appRoute.editContent);
    app.get('/preview/:collectionName/:objectId', authRoute.bootstrap, appRoute.previewContent);

    app.get('/model/:collectionName.js', authRoute.bootstrap, jsRoute.model);
    app.get('/form/:collectionName.js', authRoute.bootstrap, jsRoute.form);
    app.get('/config/:collectionName.json', authRoute.bootstrap, jsRoute.config);

    app.get('/api/search/:collectionName', authRoute.bootstrap, apiRoute.collectionSearch);
    app.post('/api/fs.files', authRoute.bootstrap, apiRoute.fileObject);
    app.get('/api/fs.files/:objectId', authRoute.bootstrap, apiRoute.fileObject);
    app.get('/api/fs.files/:objectId/:view', authRoute.bootstrap, apiRoute.fileObject);
    app.del('/api/fs.files/:objectId', authRoute.bootstrap, apiRoute.fileObject);
    app.get('/api/:collectionName/:objectId/revisions', authRoute.bootstrap, apiRoute.revisions);
    app.post('/api/:collectionName', authRoute.bootstrap, apiRoute.collectionObject);
    app.get('/api/:collectionName/:objectId', authRoute.bootstrap, apiRoute.collectionObject);
    app.put('/api/:collectionName/:objectId', authRoute.bootstrap, apiRoute.collectionObject);
    app.del('/api/:collectionName/:objectId', authRoute.bootstrap, apiRoute.collectionObject);

    app.locals(global.config);

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Mongorila server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
    });

});
