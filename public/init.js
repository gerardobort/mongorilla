require.config({
    baseUrl: '/',
    timeout: 30,
    map: {
        '*': {
            text: 'third-party/requirejs-text/text',
            json: 'third-party/requirejs-json/json',
            css: 'third-party/require-css/css',
            async: 'third-party/requirejs-plugins/src/async',
            goog: 'third-party/requirejs-plugins/src/goog',
        },
    },
    paths: {
        jquery: 'third-party/jquery/dist/jquery.min',
        underscore: 'third-party/underscore/underscore',
        backbone: 'third-party/backbone/backbone',
        spin: 'third-party/ladda-bootstrap/dist/spin.min',
        bootstrap: 'third-party/bootstrap/dist/js/bootstrap.min',
        moment: 'third-party/moment/moment',
        admin_lte: 'admin-lte',
        propertyParser: 'third-party/requirejs-plugins/src/propertyParser',
        datetimePicker: 'third-party/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min'
    },
    shim: {
        underscore: { exports: '_' },
        jquery: { exports: 'jQuery' },
        backbone: { deps: ['underscore', 'jquery'], exports: 'Backbone' },
        'third-party/backbone-forms/distribution/templates/bootstrap3': {
            deps: ['backbone-forms/editors/list'],
        },
        bootstrap: { deps: ['jquery'] },
        admin_lte: {
            deps: [
                'third-party/AdminLTE/js/plugins/slimScroll/jquery.slimscroll.min',
                'third-party/AdminLTE/js/plugins/iCheck/icheck.min',
                'bootstrap'
            ]
        },
        datetimePicker: {
        	deps: [
        		'moment'
        	]
        },
        'third-party/backbone-deep-model/distribution/deep-model.min': { deps: ['backbone'] },
        'third-party/backbone-forms/distribution/backbone-forms': { deps: ['backbone'] },
        'backbone-forms/adapters/bootstrap-modal': { deps: ['jquery', 'underscore', 'backbone'] },
        'backbone-forms/editors/list': { deps: ['backbone', 'backbone-forms/adapters/bootstrap-modal'] },
        'backbone-forms/editors/file': { deps: ['backbone'] },
        'backbone-forms/editors/image': { deps: ['backbone'] },
        'backbone-forms/editors/object-id': { deps: ['backbone'] },
        'backbone-forms/editors/ckeditor': { deps: ['backbone'] },
        'backbone-forms/editors/datepicker': { deps: ['backbone'] },
        'backbone-forms/editors/datetimepicker': { deps: ['backbone', 'datetimePicker'] },
        'backbone-forms/editors/colorpicker': { deps: ['backbone', 'third-party/AdminLTE/js/plugins/colorpicker/bootstrap-colorpicker.min'] }
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

require(['backbone', 'bootstrap'], function (Backbone) {
    require([
            'third-party/alertify.js/lib/alertify.min',
            'third-party/backbone-deep-model/distribution/deep-model.min',
            'third-party/backbone-forms/distribution/backbone-forms',
            'third-party/humane-dates/humane',
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
