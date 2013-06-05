define('model/<%= collection.name %>', [
        <%= _(collection.relations).map(function (relation, key) { return '\'model/' + relation.relatedCollection + '\''; }).join(', ') %>
    ], function (
        <%= _(collection.relations).map(function (relation, key) { return relation.relatedCollection.toCamelCase(); }).join(', ') %>
    ) {

    Backbone.Model.<%= collection.name.toCamelCase() %> = Backbone.RelationalModel.extend({
        defaults: <%= JSON.stringify(collection.backboneForms.defaults||{}) %>,
        schema: <%= global.helpers.stringify(collection.backboneForms.schema||{}) %>,
        relations: [
            <% _(collection.relations).each(function (relation, key) { %>
                {
                    type: Backbone.<%= relation.type %>,
                    key: '<%= key %>',
                    relatedModel: <%= relation.relatedCollection.toCamelCase() %>,
                    collectionType: Backbone.Collection,
                    reverseRelation: {
                        key: '<%= collection.name %>',
                        includeInJSON: false
                    }
                },
            <% }) %>
        ]
        
    });

    return Backbone.Model.<%= collection.name.toCamelCase() %>;
});
