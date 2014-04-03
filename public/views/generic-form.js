define('views/generic-form', [
        '/third-party/ladda-bootstrap/dist/ladda.min.js',
        '/third-party/bootstrap-datepicker/js/bootstrap-datepicker.js',
        '/third-party/backbone-forms/distribution/adapters/backbone.bootstrap-modal.js',
        '/third-party/bs-fancyfile/js/bootstrap-fancyfile.min.js',
        '/third-party/ckeditor/ckeditor.js',
        '/third-party/twitter-bootstrap-typeahead/js/bootstrap-typeahead.js',

        '/backbone-forms/editors/list.js',
        '/backbone-forms/editors/file.js',
        '/backbone-forms/editors/image.js',
        '/backbone-forms/editors/object-id.js',
        '/backbone-forms/editors/ckeditor.js',
        '/backbone-forms/editors/datepicker.js',

        '/third-party/backbone-forms/distribution/templates/bootstrap3.js',
    ], function (Ladda) {

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

                if (!instance.model.isNew()) {
                    instance.bindModelEvents();
                }

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
                controlsHtml +='<button class="btn btn-danger btn-lg remove ladda-button" data-style="expand-right">Delete</button>';
            }
            if ($('[data-permission-u], [data-permission-c]').size()) {
                controlsHtml += '<button class="btn btn-primary btn-lg submit ladda-button" data-style="expand-right">'
                    + (instance.objectId ? 'Save' : 'Create') + '</button>';
            }
            if (!instance.model.isNew()) {
                controlsHtml += '<a class="btn btn-info btn-lg preview" href="/preview/'
                    + instance.collectionName + '/' + instance.objectId + '" target="_blank" >Preview</a>';
            }
            instance.$el.html(controlsHtml);
            instance.laddaSubmit = Ladda.create(instance.$('.submit').get(0));
            instance.laddaRemove = Ladda.create(instance.$('.remove').get(0));
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
                    revisionsModel: revisionsModel,
                    config: instance.config
                });
                instance.revisionsView.render();
            });
        },

        submit: function (event) {
            var instance = this;
            var err;
            if (instance.revisionsView) {
                instance.revisionsView.pushRevision(false);
            }
            if (!(err = instance.form.commit())) {
                instance.laddaSubmit.start();
                var isNew = instance.model.isNew();
                instance.model.save({}, {
                    silent: true,
                    success: function () {
                        instance.laddaSubmit.stop();
                        alertify.success('success!');
                        if (isNew) {
                            document.location.href = '/edit/' + instance.collectionName + '/' + instance.model.id;
                        } else {
                            if (instance.revisionsView) {
                                require([
                                    'json!/api/' + instance.collectionName + '/' + instance.objectId + '/revisions?t=' + Math.random()
                                    ], function (revisionsModel) {
                                    instance.revisionsView.revisionsModel = revisionsModel;
                                    instance.revisionsView.render(); // repaint view
                                });
                            }
                            $('[data-updated]').html(humaneDate(instance.model.get(instance.config.updatedField.key)));
                        }
                    },
                    error: function () {
                        instance.laddaSubmit.stop();
                        alertify.error('an error has ocurred! :S');
                    }
                });
            } else {
                instance.laddaSubmit.stop();
                console.log('model err', err);
                alertify.error('validation failed, look at the console for details.');
            }
        },

        remove: function (event) {
            var instance = this;
            instance.laddaRemove.start();
            alertify.confirm('Are you sure you want to delete this '+ instance.collectionName, function (ok) {
                instance.laddaRemove.stop();
                if (ok) {
                    instance.model.destroy({
                        success: function () {
                            document.location.href = '/search/' + instance.collectionName;
                        }
                    });
                }
            });
        },

        /* adds compatibility to form refreshing on model change */
        bindModelEvents: function () {
            var instance = this;
            instance.model.on('change', function(model) {
                _(instance.config.schema).each(function (schema, prop) {
                    if (!model.hasChanged(prop)) {
                        return;
                    }
                    var obj = {};
                    obj[prop] = model.get(prop);
                    instance.form.setValue(obj);
                });
            });
        },

    });

});
