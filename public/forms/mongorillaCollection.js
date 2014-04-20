define('forms/mongorillaCollection', [
    'forms/base/mongorillaCollection',
    'models/mongorillaCollection'
    ], function (MongorillaCollectionFormBase, MongorillaCollectionModel) {

    Backbone.Form.MongorillaCollection = MongorillaCollectionFormBase.extend({

        events: {
            'click #type': 'toggleTypeConditionalFields',
            'click #validators li input': 'toggleValidatorsConditionalFields',
        },

        toggleTypeConditionalFields: function (event) {
            var $type = $(event.target),
                editorType = $type.val();
                // those types that supports editorAttrs/placeholder
                this.$('[name="placeholder"]').closest('.form-group').toggle(
                    (['Text', 'Datepicker', 'File'].indexOf(editorType) !== -1)
                );
        },

        toggleValidatorsConditionalFields: function (event) {
            var $checkbox = $(event.target);
            if ($checkbox.val() === 'regexp') {
                this.$('[name="validators_settings_regexp"]').closest('.form-group').toggle($checkbox.is(':checked'));
            }
            if ($checkbox.val() === 'match') {
                this.$('[name="validators_settings_match_field"]').closest('.form-group').toggle($checkbox.is(':checked'));
                this.$('[name="validators_settings_match_message"]').closest('.form-group').toggle($checkbox.is(':checked'));
            }
        },

    });

    return Backbone.Form.MongorillaCollection;

});
