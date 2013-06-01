define('model/<%= collection.name %>', [], function () {

    Backbone.Model.<%= collection.name.toCamelCase() %> = Backbone.RelationalModel.extend({
        defaults: <%= JSON.stringify(collection.backboneForms.defaults||{}) %>
    });

    return Backbone.Model.<%= collection.name.toCamelCase() %>;
});
