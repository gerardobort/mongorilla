define('models/<%= collection.name %>-revision', [], function () {

    Backbone.Model.<%= collection.name.toCamelCase() %>Revision = Backbone.DeepModel.extend({
        idAttribute: '_id',
        urlRoot: '/api/<%= collection.name %>/:objectId/revisions',
        toString: function () {
            <% if (collection.toStringField) { %>
            return this.get('snapshot.<%= collection.toStringField %>');
            <% } else { %>
            return 'Missing config setting: collection.toStringField must be set';
            <% } %>
        }
    });

    return Backbone.Model.<%= collection.name.toCamelCase() %>Revision;
});
