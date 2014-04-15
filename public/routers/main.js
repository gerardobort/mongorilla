define('routers/main', [
        'spin',
        'mongorilla/config/spinner-default',
        'third-party/ladda-bootstrap/dist/ladda.min',
    ], function (Spinner, spinnerOptions, Ladda) {

    return Backbone.Router.extend({

        routes: {
            'auth/login': 'loginForm',
            'dashboard': 'dashboard',
            'add/:collectionName': 'createForm',
            'edit/:collectionName/:objectId': 'editForm',
            'search/:collectionName': 'searchForm',
        },

        initialize: function () {
            require(['views/layout/header/view'], function (HeaderView) {
                var view = new HeaderView();
            });
            require(['views/layout/sidebar/view'], function (SidebarView) {
                var view = new SidebarView();
            });
            console.log('Mongorilla!');
        },

        dashboard: function () {
            require(['views/dashboard/widget/collections-pie/view'], function (WidgetPieView) {
                var el = $('[data-view="dashboard/widget/collections-pie/view"]').get(0);
                (new Spinner(spinnerOptions)).spin(el);
                var view = new WidgetPieView({ el: el });
            });
            require(['views/dashboard/widget/editions-chart/view'], function (WidgetChartView) {
                var el = $('[data-view="dashboard/widget/editions-chart/view"]').get(0);
                (new Spinner(spinnerOptions)).spin(el);
                var view = new WidgetChartView({ el: el });
            });
            $('[data-view="dashboard/widget/recent/view"]').each(function (i, el) {
                require(['views/dashboard/widget/recent/view'], function (WidgetRecentView) {
                    (new Spinner(spinnerOptions)).spin(el);
                    var view = new WidgetRecentView({ el: el });
                });
            });
        },

        loginForm: function () {
            require(['views/login/form'], function (LoginFormView) {
                var form = new LoginFormView();
            });
        },

        createForm: function (collectionName) {
            var el = $('#collection-form').get(0);
            (new Spinner(spinnerOptions)).spin(el);
            require(['views/generic/form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName });
            });
        },

        editForm: function (collectionName, objectId) {
            var el = $('#collection-form').get(0);
            (new Spinner(spinnerOptions)).spin(el);
            require(['views/generic/form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName, objectId: objectId });
            });
        },

        searchForm: function (collectionName) {
            var el = $('#collection-list').get(0);
            (new Spinner(spinnerOptions)).spin(el);
            require(['views/generic/search'], function (SearchFormView) {
                var form = new SearchFormView({ collectionName: collectionName });
            });
        },

    });

});
