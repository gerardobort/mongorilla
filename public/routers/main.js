define('routers/main', [], function () {

    return Backbone.Router.extend({

        routes: {
            'add/:collectionName': 'createForm',
            'edit/:collectionName/:objectId': 'editForm',
            'search/:collectionName': 'searchForm',
        },

        initialize: function () {
            console.log('Mongorilla!');
        },

        createForm: function (collectionName) {
            require(['views/generic-form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName });
            });
        },

        editForm: function (collectionName, objectId) {
            require(['views/generic-form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName, objectId: objectId });
            });
        },

        searchForm: function (collectionName) {
            require(['views/search-form'], function (SearchFormView) {
                var form = new SearchFormView({ collectionName: collectionName });
            });
        },

    });

});
