define(['model/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    <%
        var schema = collection.backboneForms.schema||{};
        //_(collection.relations).each(function (relation, key) {
        //   delete schema[key];
        //});
    %>

    Backbone.Form.<%= collection.name.toCamelCase() %> = Backbone.Form.extend({
        schema: <%= global.helpers.stringify(schema) %>
    });

    return Backbone.Form.<%= collection.name.toCamelCase() %>;

});


