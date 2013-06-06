define(['model/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    <%

        var schema = collection.backboneForms.schema||{};

    %>

    Backbone.Form.<%= collection.name.toCamelCase() %> = Backbone.Form.extend({
        schema: <%= global.helpers.stringify(schema) %>
    });

    return Backbone.Form.<%= collection.name.toCamelCase() %>;

});


