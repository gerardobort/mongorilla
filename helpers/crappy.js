/*
 * crappy helpers.
 * TODO Refactor - this is a bag of separate functions
 */

var _ = require('underscore');

exports.stringify = function (obj) {
    var nobj = _(obj).clone();
    nobj = objToStringJS(nobj);
    var str = JSON.stringify(nobj);
    str = str.replace(/"__js:([^"]*)"/g, '$1').replace(/\\n/g, '\n');
    return str;
};

exports.url = function(options) {
    console.log('Unbale to create URL:', options);
    return '/';
};

function deepClone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = deepClone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = deepClone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
}

exports.deepClone = deepClone;


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

        var func = objToJS__construct(global[obj.__constructor], obj.__arguments||[]);
        if (obj.__call) {
            return '__js:' + func.call(obj.__call); //.toString();
        }
        return '__js:' + func.toString();
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
