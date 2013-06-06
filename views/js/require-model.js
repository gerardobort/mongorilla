define('model/<%= collection.name %>', [
        <%= _(collection.relations).map(function (relation, key) { return '\'model/' + relation.relatedCollection + '\''; }).join(', ') %>
    ], function (
        <%= _(collection.relations).map(function (relation, key) { return relation.relatedCollection.toCamelCase(); }).join(', ') %>
    ) {


    <%
        var schema = {};
        // exclude all relationship fields from the model schema, they must be set on the form schemas
        _(collection.backboneForms.schema).each(function (def, key) {
            if (!(collection.relations && collection.relations[key])) {
                schema[key] = def;
            }
        });
    %>

    Backbone.Model.<%= collection.name.toCamelCase() %> = Backbone.RelationalModel.extend({
        // TODO path backbone-forms to perform findOrCreate instead of new when instantiating models... then we can remove this
        //id: '_id',
        defaults: <%= JSON.stringify(collection.backboneForms.defaults||{}) %>,
        schema: <%= global.helpers.stringify(schema) %>,
        relations: [
            <% _(collection.relations).each(function (relation, key) { %>
                {
                    type: Backbone.<%= relation.type %>,
                    key: '<%= key %>',
                    relatedModel: <%= relation.relatedCollection.toCamelCase() %>,
                    <% if ('HasOne' !== relation.type) { %>
                    collectionType: Backbone.Collection,
                    <% } %>
                    reverseRelation: {
                        key: '<%= collection.name %>',
                        includeInJSON: false
                    }
                },
            <% }) %>
        ],
        toString: function () {
            <% if (collection.toStringField) { %>
            return this.get('<%= collection.toStringField %>') 
                + ' <a class="btn" target="_blank" href="/edit/<%= collection.name %>/'
                + this.get('_id') + '"><i class="icon-edit"></i></a>';
            <% } else { %>
            return 'Missing config setting: collection.toStringField must be set';
            <% } %>
        }
    });

    return Backbone.Model.<%= collection.name.toCamelCase() %>;
});
