define('collections/<%= collection.name %>-revision', ['models/<%= collection.name %>-revision'], function (<%= collection.name.toCamelCase() %>RevisionModel) {

    Backbone.Collection.<%= collection.name.toCamelCase() %>Revision = Backbone.Collection.extend({
        url: '/api/<%= collection.name %>',
        model: <%= collection.name.toCamelCase() %>RevisionModel,
        parse: function (response) {
            this.pager = response.pager;
            return response.data;
        }
    });

    return Backbone.Collection.<%= collection.name.toCamelCase() %>Revision;
});
