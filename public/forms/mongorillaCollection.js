define('forms/mongorillaCollection', [
    'forms/mongorillaCollection.base',
    'models/mongorillaCollection',
    'css!./mongorillaCollection.css'
    ], function (MongorillaCollectionFormBase, MongorillaCollectionModel) {

    Backbone.Form.MongorillaCollection = MongorillaCollectionFormBase.extend({

        events: {
            'click #type': 'toggleTypeConditionalFields',
            'click #validators li input': 'toggleValidatorsConditionalFields',
        },

        render: function () {
            var instance = this;

            setTimeout(function () {
                instance.trigger('backboneForms.schema:change', instance, instance.getEditor('backboneForms.schema'));
            }, 300);

            setTimeout(function () {
                var warning = '\
                    <div class="alert alert-warning alert-dismissable experimental-warn">\
                        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>\
                        <h3><strong>Warning!</strong> <code>Mongorilla Collection</code> is currently an experimental feature.</h3>\
                        <p>We don\'t guarantee future support yet, since this is now subject to testing and approval.</p>\
                    </div>\
                ';
                $('.experimental-warn').remove();
                $('#main-container').prepend(warning);
            }, 0);

            return Backbone.Form.prototype.render.apply(this, arguments);
        },

        initialize: function () {
            var instance = this;

            instance.bind('backboneForms.schema:change', function (form, editor) {
                var toStringFieldEditor = instance.getEditor('toStringField');
                toStringFieldEditor.schema.options = _(editor.getValue()).map(function (editor) {
                    return { val: editor.path, label: editor.title };
                });
                toStringFieldEditor.render();
            });

            instance.bind('humanName:change', function (form, editor) {
                var nameEditor = instance.getEditor('name');
                if (nameEditor.tainted) {
                    return;
                }
                nameEditor.setValue(
                    editor.getValue().replace(/\W+/g, '_').replace(/^\W*(.*)\W$/, '$1').toLowerCase()
                );
            });

            instance.bind('name:change', function (form, editor) {
                editor.tainted = true;
            });

            var ret = Backbone.Form.prototype.initialize.apply(this, arguments);
            // @see editors.List openEditor method (backbone-forms/editors/list.js:515)
            instance.getEditor('backboneForms.schema').form = new Backbone.Form({});
            return ret;
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
