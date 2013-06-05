define(['model/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    Backbone.Form.<%= collection.name.toCamelCase() %> = Backbone.Form.extend({
        schema: <%= JSON.stringify(collection.backboneForms.schema||{}) %>
    });

    return Backbone.Form.<%= collection.name.toCamelCase() %>;

});


