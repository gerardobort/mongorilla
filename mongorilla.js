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
    authRoute = require('./routes/auth'),
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
//app.use(express.json())
//   .use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.limit('15mb'));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// mongo and models
var dbConnString = global.config.MONGO_URL || process.env.MONGORILA_MONGO_URL;
console.log('Connecting to ' + dbConnString.replace(/^.*@/, '') + ' ...');
app.set('db', mongoose.connect(dbConnString, { db: { safe: true }}));
// this sucks
app.set('gfs', gridfs(app.get('db').connections[0].db, mongoose.mongo));

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


// routes
app.get('/', authRoute.bootstrap, appRoute.index);

app.post('/user/login', authRoute.login);
app.get('/user/logout', authRoute.logout);

app.get('/dashboard', authRoute.bootstrap, appRoute.dashboard);
app.get('/add/:collectionName', authRoute.bootstrap, appRoute.addContent);
app.get('/search/:collectionName', authRoute.bootstrap, appRoute.searchContent);
app.get('/edit/:collectionName/:objectId', authRoute.bootstrap, appRoute.editContent);

app.get('/model/:collectionName.js', authRoute.bootstrap, jsRoute.model);
app.get('/form/:collectionName.js', authRoute.bootstrap, jsRoute.form);
app.get('/config/:collectionName.json', authRoute.bootstrap, jsRoute.config);

app.get('/api/search/:collectionName', authRoute.bootstrap, apiRoute.collectionSearch);
app.post('/api/fs.files', authRoute.bootstrap, apiRoute.fileObject);
app.get('/api/fs.files/:objectId', authRoute.bootstrap, apiRoute.fileObject);
app.post('/api/:collectionName', authRoute.bootstrap, apiRoute.collectionObject);
app.get('/api/:collectionName/:objectId', authRoute.bootstrap, apiRoute.collectionObject);
app.put('/api/:collectionName/:objectId', authRoute.bootstrap, apiRoute.collectionObject);
app.del('/api/:collectionName/:objectId', authRoute.bootstrap, apiRoute.collectionObject);

app.locals(global.config);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Mongorila server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
