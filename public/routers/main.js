define('routers/main', [], function () {

    return Backbone.Router.extend({

        routes: {
            'add/:collectionName': 'createForm',
            'edit/:collectionName/:objectId': 'editForm',
            'search/:collectionName': 'searchForm',
        },

        initialize: function () {
        },

        createForm: function (collectionName) {
            require(['views/generic-form'], function () {
            });
        },

        editForm: function (collectionName, objectId) {
            require(['views/generic-form'], function () {
            });
        },

        searchForm: function (collectionName) {
            require(['views/search-form'], function () {
            });
        },

    });

});
