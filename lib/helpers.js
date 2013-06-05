
/*
 * helpers.
 */

exports.stringify = function (obj) {
    var str = JSON.stringify(obj);
    // TODO remove this commented part for getting regexps to work from json
    //str.replace(/:"\/([^\/]*)\/([^"]*)"(,|})/g, '/$1/$2');
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
    }).join(' ');
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
