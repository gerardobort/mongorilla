define('routers/main', ['mongorilla-spinner'], function (spinner) {

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
            spinner.spin($('#collection-form').get(0))
            require(['views/generic-form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName });
            });
        },

        editForm: function (collectionName, objectId) {
            spinner.spin($('#collection-form').get(0))
            require(['views/generic-form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName, objectId: objectId });
            });
        },

        searchForm: function (collectionName) {
            spinner.spin($('#collection-list').get(0))
            require(['views/generic-search'], function (SearchFormView) {
                var form = new SearchFormView({ collectionName: collectionName });
            });
        },

    });

});
