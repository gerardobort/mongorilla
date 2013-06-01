define(['model/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    Backbone.Form.<%= collection.name.toCamelCase() %> = Backbone.Form.extend({
        schema: <%= global.helpers.stringify(collection.backboneForms.schema||{}) %>
    });

    return Backbone.Form.<%= collection.name.toCamelCase() %>;

});


