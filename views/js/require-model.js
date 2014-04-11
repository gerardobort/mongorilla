define('models/<%= collection.name %>', [
        <%= _(collection.relations).filter(function (relation) { return 'fs.files' !== relation.relatedCollection; }).map(function (relation, key) { return '\'models/' + relation.relatedCollection + '\''; }).join(', ') %>
    ], function (
        <%= _(collection.relations).filter(function (relation) { return 'fs.files' !== relation.relatedCollection; }).map(function (relation, key) { return relation.relatedCollection.toCamelCase(); }).join(', ') %>
    ) {
    <%
        var schema = {};
    %>

    Backbone.Model.<%= collection.name.toCamelCase() %> = Backbone.DeepModel.extend({
        idAttribute: '_id',
        urlRoot: '/api/<%= collection.name %>',
        defaults: <%= JSON.stringify(collection.backboneForms.defaults||{}) %>,
        schema: <%= global.helpers.stringify(schema) %>,
        toString: function () {
            <% if (collection.toStringField) { %>
            return this.get('<%= collection.toStringField %>');
            <% } else { %>
            return 'Missing config setting: collection.toStringField must be set';
            <% } %>
        }
    });

    return Backbone.Model.<%= collection.name.toCamelCase() %>;
});
