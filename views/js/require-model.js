define('model/<%= collection.name %>', [
        <%= _(collection.relations).filter(function (relation) { return 'fs.files' !== relation.relatedCollection; }).map(function (relation, key) { return '\'model/' + relation.relatedCollection + '\''; }).join(', ') %>
    ], function (
        <%= _(collection.relations).filter(function (relation) { return 'fs.files' !== relation.relatedCollection; }).map(function (relation, key) { return relation.relatedCollection.toCamelCase(); }).join(', ') %>
    ) {
    <%

        var schema = {};

        if ((s.type === 'List' && s.itemType === 'ObjectId') || (s.type === 'ObjectId')) {
            var relatedCol = _(global.config.collections).find(function (c) {
                return c.name === collection.relations[key].relatedCollection;
            });
            schema[key].help = 'Search for ' + relatedCol.humanName 
                + ' > ' + (relatedCol.backboneForms.schema[relatedCol.toStringField].title||relatedCol.toStringField);
            schema[key].autocompleteField = relatedCol.toStringField;
            schema[key].autocompleteCollectionName = relatedCol.name;
        }

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
