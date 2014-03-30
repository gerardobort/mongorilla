require.config({
    baseUrl: '/',
    map: {
        '*': {
            text: '/third-party/requirejs-text/text.js',
            json: '/third-party/requirejs-json/json.js',
            css: '/third-party/require-css/css.js',
        },
    },
    paths: {
        jquery: '/third-party/jquery/dist/jquery.min',
        underscore: '/third-party/underscore/underscore',
        backbone: '/third-party/backbone/backbone',
    },
    shim: {
        underscore: { exports: '_' },
        backbone: { deps: ['underscore', 'jquery'], exports: 'Backbone' }
    }
});

require(['backbone'], function () {
    require([
            '/third-party/backbone-deep-model/distribution/deep-model.min.js',
            '/third-party/bootstrap-modal/js/bootstrap-modal.js',
            '/third-party/bootstrap/dist/js/bootstrap.min.js',
            '/third-party/bootstrap-datepicker/js/bootstrap-datepicker.js',
            '/lib/bootstrap-typeahead.js',
            '/lib/humane.js',
            'helpers/string'
        ], function () {

            require(['routers/main'], function (MainRouter) {
                var mainRouter = new MainRouter();
                Backbone.history.start({ root: "", pushState: true });
            });

    });
});
