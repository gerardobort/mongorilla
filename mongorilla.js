/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mongooseWhen = require('mongoose-when'),
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
app.set('db', mongoose.connect(process.env.MONGORILA_MONGO_URL));
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
    if (file.match(/\.js$/)) {
        require(models_path+'/'+file);
    }
});


// inlcude helpers module
global.helpers = require('./lib/helpers');
global.getModel = require('./models/handler').getModel;

// routes
app.get('/', appRoute.bootstrap, appRoute.index);
app.get('/add/:collectionName', appRoute.bootstrap, appRoute.addContent);
app.get('/search/:collectionName', appRoute.bootstrap, appRoute.searchContent);
app.get('/edit/:collectionName/:objectId', appRoute.bootstrap, appRoute.editContent);

app.get('/model/:collectionName.js', appRoute.bootstrap, jsRoute.model);
app.get('/form/:collectionName.js', appRoute.bootstrap, jsRoute.form);
app.get('/config/:collectionName.json', apiRoute.bootstrap, jsRoute.config);

app.get('/api/database/info', apiRoute.bootstrap, apiRoute.databaseInfo);
app.get('/api/search/:collectionName', apiRoute.bootstrap, apiRoute.collectionSearch);
app.get('/api/:collectionName', apiRoute.bootstrap, apiRoute.collection);
app.get('/api/:collectionName/:objectId', apiRoute.bootstrap, apiRoute.collectionObject);

app.locals(global.config);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Mongorila server listening on port ' + app.get('port') + ' on ' + app.get('env') + ' env.');
});
