define('views/generic-form', [
        '/third-party/bootstrap-datepicker/js/bootstrap-datepicker.js',
        '/third-party/backbone-forms/distribution/adapters/backbone.bootstrap-modal.js',
        '/third-party/bs-fancyfile/js/bootstrap-fancyfile.min.js',
        '/third-party/ckeditor/ckeditor.js',
        '/lib/bootstrap-typeahead.js',
        '/lib/editors/list.js',
        '/lib/editors/file.js',
        '/lib/editors/image.js',
        '/lib/editors/object-id.js',
        '/lib/editors/ckeditor.js',
        '/lib/editors/datepicker.js',
        '/third-party/backbone-forms/distribution/templates/bootstrap3.js',
    ], function () {

    return Backbone.View.extend({

        events: {
            'click .submit': 'submit',
            'click .remove': 'remove',
        },

        initialize: function (options) {
            var instance = this;

            instance.collectionName = options.collectionName;
            instance.objectId = options.objectId;

            instance.setElement($('#form-controls').get(0));

            require([
                'model/' + instance.collectionName, 
                'form/' + instance.collectionName,
                'json!/config/' + instance.collectionName + '.json',
                'json!/api/' + instance.collectionName + '/' + (instance.objectId||'default'),
                ], function (Model, Form, config, modelData) {


                instance.config = config;
                instance.model = new Model(modelData);
                instance.form = new Form({
                    model: instance.model,
                    fieldsets: instance.config.fieldsets,
                    schema: Form.prototype.schema // force the schema against the model one
                });

                $('#collection-form').html(instance.form.render().$el);
                instance.renderFormControls();
                if (instance.objectId) {
                    instance.renderRevisionsControls();
                }

                instance.applyRevisionsPatch();

            });

            if (instance.$el.data('readonly')) {
                $('.submit, .remove', instance.$el).attr('disabled', 'disabled');
            }
        },

        render: function () {
        },

        renderFormControls: function () {
            var instance = this;
            var controlsHtml = '';
            if (instance.objectId && $('[data-permission-d]').size()) {
                controlsHtml +='<button class="btn btn-danger btn-lg remove">Delete</button>';
            }
            if ($('[data-permission-u], [data-permission-c]').size()) {
                controlsHtml += '<button class="btn btn-primary btn-lg submit">'
                    + (instance.objectId ? 'Save' : 'Create') + '</button>';
            }
            if (!instance.model.isNew()) {
                controlsHtml += '<a class="btn btn-info btn-lg preview" href="/preview/'
                    + instance.collectionName + '/' + instance.objectId + '" target="_blank" >Preview</a>';
            }
            instance.$el.html(controlsHtml);
        },

        renderRevisionsControls: function () {
            var instance = this;
            $('[data-collection-tostringfield]').html(instance.model.toString());
            $('[data-created]').html(humaneDate(instance.model.get(instance.config.createdField.key)));
            $('[data-updated]').html(humaneDate(instance.model.get(instance.config.updatedField.key)));

            // TODO convert revisionsModel into a collection and handle it with async events
            require([
                'views/generic-form-revisions',
                'json!/api/' + instance.collectionName + '/' + instance.objectId + '/revisions?t=' + Math.random()
                ], function (GenericFormRevisionsView, revisionsModel) {

                instance.revisionsView = new GenericFormRevisionsView({
                    model: instance.model,
                    revisionsModel: revisionsModel
                });
                instance.revisionsView.render();
            });
        },

        submit: function () {
            var instance = this;
            var err;
            if (!(err = instance.form.commit())) {
                console.log('model submitted', instance.form.model.toJSON());
                var isNew = instance.model.isNew();
                instance.model.save({}, {
                    success: function () {
                        alert('success!');
                        if (isNew) {
                            document.location.href = '/edit/' + instance.collectionName + '/' + instance.model.id;
                        } else {
                            instance.revisionsView && instance.revisionsView.render(); // repaint view
                            $('[data-updated]').html(humaneDate(instance.model.get(instance.config.updatedField.key)));
                        }
                    },
                    error: function () {
                        alert('an error has ocurred! :S');
                    }
                });
            } else {
                console.log('model err', err);
                alert('validation failed, look at the console for details.');
            }
        },

        remove: function () {
            var instance = this;
            if (confirm('Are you sure you want to delete this '+ instance.collectionName)) {
                instance.model.destroy({
                    success: function () {
                        document.location.href = '/search/' + instance.collectionName;
                    }
                });
            }
        },

        /* adds compatibility for form refreshing on model change */
        applyRevisionsPatch: function () {
            var instance = this;
            _(instance.config.schema).each(function (schema, prop) {
                instance.model.on('change:' + prop, function(model, val) {
                    var obj = {};
                    if (instance.config.schema[prop].type === 'Date') {
                        val = new Date(val);
                    }
                    obj[prop] = val;
                    instance.form.setValue(obj);
                });
            });
        }

    });

});
