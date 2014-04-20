define('forms/mongorillaCollection', [
    'forms/base/mongorillaCollection',
    'models/mongorillaCollection',
    'css!./mongorillaCollection.css'
    ], function (MongorillaCollectionFormBase, MongorillaCollectionModel) {

    Backbone.Form.MongorillaCollection = MongorillaCollectionFormBase.extend({

        events: {
            'click #type': 'toggleTypeConditionalFields',
            'click #validators li input': 'toggleValidatorsConditionalFields',
        },

        initialize: function () {
            var instance = this;

            setTimeout(function () {
                var warning = '\
                    <div class="alert alert-warning alert-dismissable diff-report">\
                        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>\
                        <h3><strong>Warning!</strong> <code>Mongorilla Collection</code> is currently an experimental feature.</h3>\
                        <p>We don\'t guarantee future support yet, since this is now subject to testing and approval.</p>\
                    </div>\
                ';
                $('#main-container').prepend(warning);
            }, 0);
            return Backbone.Form.prototype.initialize.apply(this, arguments);
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
