define('model/<%= collection.name %>', [], function () {

    Backbone.Model.<%= collection.name.toCamelCase() %> = Backbone.RelationalModel.extend({
        defaults: <%= JSON.stringify(collection.backboneForms.defaults||{}) %>,
        schema: <%= JSON.stringify(collection.backboneForms.schema||{}) %>
    });

    return Backbone.Model.<%= collection.name.toCamelCase() %>;
});
