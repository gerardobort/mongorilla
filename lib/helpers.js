
/*
 * helpers.
 */

var _ = require('underscore');

exports.stringify = function (obj) {
    var nobj = _(obj).clone();
    nobj = objToStringJS(nobj);
    var str = JSON.stringify(nobj);
    str = str.replace(/"__js:([^"]*)"/g, '$1');
    return str;
};

String.prototype.crop = function (max, ellypsis) {
    var str = this.replace(/<[^>]*?>/g, '');
    if (str.length > max) {
        return str.substr(0, max) + (ellypsis || '...');
    }
    return str;
};

String.prototype.sanitize = function () {
    var str = this.replace(/<[^>]*?>/g, '');
    return str;
};

String.prototype.makeSafeForRegex = function () {
    var str = this.replace(/([\#\^\$\*\+\|\(\)\{\}\[\]\\])/g, '\\$1');
    return str;
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,"");
}

String.prototype.ucWords = function () {
    return this.split(' ').map(function (w) {
        return w.substr(0, 1).toUpperCase() + w.substr(1); 
    }).join(' ');
}

String.prototype.toCamelCase = function () {
    return this.split(/\W+/g).map(function (w) {
        return w.substr(0, 1).toUpperCase() + w.substr(1); 
    }).join('');
}

String.prototype.parseUrl = function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
        return '<a href="' + url + '" target="_blank" rel="nofollow">' + url + '</a>';
    });
};

exports.url = function(options) {
    console.log('Unbale to create URL:', options);
    return '/';
};

/**
 * Takes a nested object and returns a shallow object keyed with the path names
 * e.g. { "level1.level2": "value" }
 *
 * @param  {Object}      Nested object e.g. { level1: { level2: 'value' } }
 * @return {Object}      Shallow object with path names e.g. { 'level1.level2': 'value' }
 */
// taken from https://github.com/powmedia/backbone-deep-model/blob/master/distribution/deep-model.js
function objToPaths(obj) {
    var ret = {},
        separator = '.';

    for (var key in obj) {
        var val = obj[key];

        if (val && val.constructor === Object && !_.isEmpty(val)) {
            //Recursion for embedded objects
            var obj2 = objToPaths(val);

            for (var key2 in obj2) {
                var val2 = obj2[key2];

                ret[key + separator + key2] = val2;
            }
        } else {
            ret[key] = val;
        }
    }

    return ret;
}

exports.toFlat = function (obj) {
    return objToPaths(obj);
};



// parse json to js, eg. { someregexp: { "__constructor": "RegExp", "__arguments": ["^.*$", "g"] }}
function objToJS__construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}

function objToStringJS(obj) {

    if (obj.__constructor) {
        return '__js:'+objToJS__construct(global[obj.__constructor], obj.__arguments||[]).toString();
    }

    for (var key in obj) {
        var val = obj[key];

        if (val && (val.constructor === Object || val.constructor === Array) && !_.isEmpty(val)) {
            //Recursion for embedded objects
            obj[key] = objToStringJS(val);
        }
    }

    return obj;
}

function objToJS(obj, map) {

    if (obj.__constructor) {
        return objToJS__construct(
            global[obj.__constructor],
            'function' === typeof map ? _(obj.__arguments||[]).map(map) : obj.__arguments||[]
        );
    }

    for (var key in obj) {
        var val = obj[key];

        if (val && (val.constructor === Object || val.constructor === Array) && !_.isEmpty(val)) {
            //Recursion for embedded objects
            obj[key] = objToJS(val, map);
        }
    }

    return obj;
}

// WARNING: use _().clone() before calling this against a config object
exports.toJS = function (obj, map) {
    return objToJS(obj, map);
};
