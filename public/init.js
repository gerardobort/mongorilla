require.config({
    baseUrl: '/',
    map: {
        '*': {
            text: '/third-party/requirejs-text/text.js',
            json: '/third-party/requirejs-json/json.js',
            css: '/third-party/require-css/css.js',
            backbone: '/third-party/backbone/backbone.js',
        },
    }

});

require([
        '/third-party/jquery/dist/jquery.min.js',
        '/third-party/underscore/underscore.js',
        '/third-party/backbone/backbone.js',
        '/third-party/backbone-deep-model/distribution/deep-model.min.js',
        '/third-party/bootstrap-modal/js/bootstrap-modal.js',
        '/third-party/bootstrap/dist/js/bootstrap.min.js',
        '/third-party/bootstrap-datepicker/js/bootstrap-datepicker.js',
        '/lib/bootstrap-typeahead.js',
        '/lib/humane.js',
        'helpers/string'
    ], function () {

        require(['init/list', 'init/edit-create-form'], function () {

            console.log('Mongorilla satrted!');

        });

});
