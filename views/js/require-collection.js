define('collections/<%= collection.name %>', ['models/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    Backbone.Collection.<%= collection.name.toCamelCase() %> = Backbone.Collection.extend({
        url: '/api/<%= collection.name %>',
        model: <%= collection.name.toCamelCase() %>Model,
        parse: function (response) {
            this.pager = response.pager;
            return response.data;
        }
    });

    return Backbone.Collection.<%= collection.name.toCamelCase() %>;
});
