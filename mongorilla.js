/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mongooseWhen = require('mongoose-when'),
    _ = require('underscore'),
    appRoute = require('./routes/app'),
    jsRoute = require('./routes/js'),
    apiRoute = require('./routes/api');


var app = express();

// config
global.config = require('config');
global.config.watchForConfigFileChanges(0);

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

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// mongo and models
var dbConnString = global.config.MONGO_URL || process.env.MONGORILA_MONGO_URL;
console.log('Connecting to ' + dbConnString.replace(/^.*@/, '') + ' ...');
app.set('db', mongoose.connect(dbConnString));
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
    if (file.match(/\.js$/)) {
        require(models_path+'/'+file);
    }
});



// inlcude helpers module
global.helpers = require('./lib/helpers');
global.getModel = require('./models/handler').getModel;

// preload all the models set in the config file
global.config.collections.forEach(function (collection) {
    var model = global.getModel(collection.name);
});

// asynchronous basic authentication
var auth = express.basicAuth(function(user, pass, callback) {
   var result = (_(global.config.users).find(function (u) { return u.username === user && u.password === pass; }));
   callback(null /* error */, result);
});

// routes
app.get('/', appRoute.bootstrap, appRoute.index);
app.get('/add/:collectionName', auth, appRoute.bootstrap, appRoute.addContent);
app.get('/search/:collectionName', auth, appRoute.bootstrap, appRoute.searchContent);
app.get('/edit/:collectionName/:objectId', auth, appRoute.bootstrap, appRoute.editContent);

app.get('/model/:collectionName.js', auth, appRoute.bootstrap, jsRoute.model);
app.get('/form/:collectionName.js', auth, appRoute.bootstrap, jsRoute.form);
app.get('/config/:collectionName.json', auth, apiRoute.bootstrap, jsRoute.config);

app.get('/api/database/info', auth, apiRoute.bootstrap, apiRoute.databaseInfo);
app.get('/api/search/:collectionName', auth, apiRoute.bootstrap, apiRoute.collectionSearch);
app.get('/api/:collectionName', auth, apiRoute.bootstrap, apiRoute.collection);
app.post('/api/:collectionName', auth, apiRoute.bootstrap, apiRoute.collectionObject);
app.get('/api/:collectionName/:objectId', auth, apiRoute.bootstrap, apiRoute.collectionObject);
app.put('/api/:collectionName/:objectId', auth, apiRoute.bootstrap, apiRoute.collectionObject);
app.del('/api/:collectionName/:objectId', auth, apiRoute.bootstrap, apiRoute.collectionObject);

app.locals(global.config);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Mongorila server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
