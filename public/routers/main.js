define('routers/main', [
        'mongorilla-spinner',
        '/third-party/ladda-bootstrap/dist/ladda.min.js',
    ], function (spinner, Ladda) {

    return Backbone.Router.extend({

        routes: {
            'auth/login': 'loginForm',
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

        loginForm: function (collectionName) {
            require(['views/login/form'], function (LoginFormView) {
                var form = new LoginFormView();
            });
        },

        createForm: function (collectionName) {
            spinner.spin($('#collection-form').get(0))
            require(['views/generic/form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName });
            });
        },

        editForm: function (collectionName, objectId) {
            spinner.spin($('#collection-form').get(0))
            require(['views/generic/form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName, objectId: objectId });
            });
        },

        searchForm: function (collectionName) {
            spinner.spin($('#collection-list').get(0))
            require(['views/generic/search'], function (SearchFormView) {
                var form = new SearchFormView({ collectionName: collectionName });
            });
        },

    });

});
