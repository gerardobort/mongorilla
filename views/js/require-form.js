define(/*'forms/<%= collection.name %>',*/['models/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    <%

        var schema = collection.backboneForms.schema||{};

        _(schema).each(function (s, key) { 
            if ((s.type === 'List' && s.itemType === 'ObjectId') || (s.type === 'ObjectId')) {
                var relatedCol = _(global.config.collections).find(function (c) {
                    return c.name === collection.relations[key].relatedCollection;
                });
                schema[key].help = 'Search for ' + relatedCol.humanName 
                    + ' > ' + (relatedCol.backboneForms.schema[relatedCol.toStringField].title||relatedCol.toStringField);
                schema[key].autocompleteField = relatedCol.toStringField;
                schema[key].autocompleteCollectionName = relatedCol.name;
            }
        });

    %>

    Backbone.Form.<%= collection.name.toCamelCase() %> = Backbone.Form.extend({
        schema: <%= global.helpers.stringify(schema) %>,
        userRoles: <%= global.helpers.stringify(userRoles) %>
    });

    return Backbone.Form.<%= collection.name.toCamelCase() %>;

});


