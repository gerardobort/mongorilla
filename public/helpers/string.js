define([], function () {

    String.prototype.toCamelCase = function () {
        return this.split(/\W+/g).map(function (w) {
            return w.substr(0, 1).toUpperCase() + w.substr(1); 
        }).join(' ');
    };

});
