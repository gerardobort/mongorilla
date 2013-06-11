require.config({
    baseUrl: "/",
    map: {
        '*': {
            text: '/lib/require/require-text.js',
            css: '/lib/require/require-css.js',
            json: '/lib/require/require-json.js'
        }
    }
});


String.prototype.toCamelCase = function () {
    return this.split(/\W+/g).map(function (w) {
        return w.substr(0, 1).toUpperCase() + w.substr(1); 
    }).join(' ');
};

require(['init/list', 'init/edit-create-form'], function () {

    console.log('Mongorilla satrted!');

});
