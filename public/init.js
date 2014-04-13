require.config({
    baseUrl: '/',
    timeout: 30,
    map: {
        '*': {
            text: '/third-party/requirejs-text/text.js',
            json: '/third-party/requirejs-json/json.js',
            css: '/third-party/require-css/css.js',
            async: '/third-party/requirejs-plugins/src/async.js',
            goog: '/third-party/requirejs-plugins/src/goog.js',
        },
    },
    paths: {
        jquery: '/third-party/jquery/dist/jquery.min',
        underscore: '/third-party/underscore/underscore',
        backbone: '/third-party/backbone/backbone',
        spin: '/third-party/ladda-bootstrap/dist/spin.min',
        bootstrap: '/third-party/bootstrap/dist/js/bootstrap.min',
        admin_lte: '/admin-lte',
        propertyParser: '/third-party/requirejs-plugins/src/propertyParser',
    },
    shim: {
        underscore: { exports: '_' },
        jquery: { exports: 'jQuery' },
        backbone: { deps: ['underscore', 'jquery'], exports: 'Backbone' },
        '/third-party/backbone-forms/distribution/templates/bootstrap3.js': {
            deps: ['/backbone-forms/editors/list.js'],
            exports: 'Backbone'
        },
        bootstrap: { deps: ['jquery'] },
        admin_lte: {
            deps: [
                '/third-party/AdminLTE/js/plugins/slimScroll/jquery.slimscroll.min.js',
                '/third-party/AdminLTE/js/plugins/iCheck/icheck.min.js',
            ]
        },
    }
});

define('mongorilla/config/spinner-default', function() {
    return {
        color: '#999',
        length: 6,
        width: 2,
        radius: 6,
        top: 20
    };
});

require(['backbone', 'bootstrap'], function () {
    require([
            '/third-party/alertify.js/lib/alertify.min.js',
            '/third-party/backbone-deep-model/distribution/deep-model.min.js',
            '/third-party/backbone-forms/distribution/backbone-forms.min.js',
            '/third-party/bootstrap-modal/js/bootstrap-modal.js',
            '/third-party/humane-dates/humane.js',
            'admin-lte',
            'helpers/string'
        ], function (alertify) {

            window.alertify = alertify;

            require(['routers/main'], function (MainRouter) {
                var mainRouter = new MainRouter();
                Backbone.history.start({ root: "", pushState: true });
            });

    });
});
