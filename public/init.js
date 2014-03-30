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
        spin: '/third-party/ladda-bootstrap/dist/spin.min',
    },
    shim: {
        underscore: { exports: '_' },
        backbone: { deps: ['underscore', 'jquery'], exports: 'Backbone' },
        '/third-party/backbone-forms/distribution/templates/bootstrap3.js': {
            deps: ['/backbone-forms/editors/list.js'],
            exports: 'Backbone'
        }
    }
});

define('mongorilla-spinner', ['spin'], function(Spinner) {
    return new Spinner({
        color: '#999',
        length: 6,
        width: 2,
        radius: 6,
        top: 20
    });
});

require(['backbone'], function () {
    require([
            '/third-party/alertify.js/lib/alertify.min.js',
            '/third-party/backbone-deep-model/distribution/deep-model.min.js',
            '/third-party/backbone-forms/distribution/backbone-forms.min.js',
            '/third-party/bootstrap-modal/js/bootstrap-modal.js',
            '/third-party/bootstrap/dist/js/bootstrap.min.js',
            '/third-party/humane-dates/humane.js',
            'helpers/string'
        ], function (alertify) {

            window.alertify = alertify;

            require(['routers/main'], function (MainRouter) {
                var mainRouter = new MainRouter();
                Backbone.history.start({ root: "", pushState: true });
            });

    });
});
