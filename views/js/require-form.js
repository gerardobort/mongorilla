define(['model/<%= collection.name %>'], function (<%= collection.name.toCamelCase() %>Model) {

    <%

        var schema = collection.backboneForms.schema||{};

        _(schema).each(function (s, key) { 
            if ((s.type === 'List' && s.itemType === 'Object') || (s.type === 'Object')) {
                var relatedCol = _(global.config.collections).find(function (c) {
                    return c.name === collection.relations[key].relatedCollection;
                });
                schema[key].subSchema = {}
                schema[key].subSchema['_id'] = { type: 'Text'};
                schema[key].subSchema[relatedCol.toStringField] = {
                    type: 'Text',
                    title: relatedCol.backboneForms.schema[relatedCol.toStringField].title || relatedCol.toStringField,
                    validators: ['required'],
                    editorAttrs: {
                        'data-autocomplete-field': relatedCol.toStringField,
                        'data-autocomplete-collection-name': relatedCol.name,
                        'placeholder': 'Search...',
                        'autocomplete': 'off'
                    }
                };
                // TODO map to function 
                schema[key].itemToString = '${function (o) { return o.' + relatedCol.toStringField + '; }}';
            }
        });
    %>

    Backbone.Form.<%= collection.name.toCamelCase() %> = Backbone.Form.extend({
        schema: <%= global.helpers.stringify(schema) %>
    });

    return Backbone.Form.<%= collection.name.toCamelCase() %>;

});


