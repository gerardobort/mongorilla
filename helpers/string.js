/*
 * String helpers.
 */

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

String.prototype.parseHtmlUrls = function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
        return '<a href="' + url + '" target="_blank" rel="nofollow">' + url + '</a>';
    });
};
