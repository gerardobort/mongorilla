require.config({
    baseUrl: "/",
    map: {
        '*': {
            text: '/third-party/requirejs-text/text.js',
            //css: '/lib/require/require-css.js',
            json: '/third-party/requirejs-json/json.js'
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
