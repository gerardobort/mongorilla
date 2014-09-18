define('views/generic/form', [
        'third-party/ladda-bootstrap/dist/ladda.min',
        'third-party/bootstrap-datepicker/js/bootstrap-datepicker',
        'third-party/bs-fancyfile/js/bootstrap-fancyfile.min',
        'third-party/ckeditor/ckeditor',
        'third-party/twitter-bootstrap-typeahead/js/bootstrap-typeahead',

        'backbone-forms/editors/list',
        'backbone-forms/editors/file',
        'backbone-forms/editors/image',
        'backbone-forms/editors/object-id',
        'backbone-forms/editors/ckeditor',
        'backbone-forms/editors/datepicker',
        'backbone-forms/editors/colorpicker',
        'backbone-forms/editors/datetimepicker',

        'third-party/backbone-forms/distribution/templates/bootstrap3',
    ], function (Ladda) {

    return Backbone.View.extend({

        events: {
            'click .submit': 'submit',
            'click .submit-draft': 'submitDraft',
            'click .remove': 'remove',
        },

        initialize: function (options) {
            var instance = this;

            instance.collectionName = options.collectionName;
            instance.objectId = options.objectId;

            instance.setElement($('#form-controls').get(0));

            require([
                'models/' + instance.collectionName, 
                'forms/' + instance.collectionName,
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

                // prevent undesired form submissions
                $('#collection-form').on('submit', function (event) { event.preventDefault(); })

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
                controlsHtml +='<button class="btn btn-danger btn-lg remove ladda-button" data-style="expand-right"><i class="fa fa-times"></i> Delete</button>';
            }
            instance.$('.left').html(controlsHtml);

            var controlsHtml = '';
            if ($('[data-permission-u], [data-permission-c]').size()) {
                if (instance.objectId) {
                    controlsHtml += '<button class="btn btn-primary btn-lg submit-draft ladda-button" data-style="expand-right"><i class="fa fa-star"></i> Save draft</button>';
                }
                controlsHtml += '<button class="btn btn-primary btn-lg submit ladda-button" data-style="expand-right"><i class="fa fa-pencil"></i> ' + (instance.objectId ? 'Save & Publish' : 'Create') + '</button>';
            }
            if (!instance.model.isNew()) {
                controlsHtml += '<a class="btn btn-info btn-lg preview" href="/preview/'
                    + instance.collectionName + '/' + instance.objectId + '" target="_blank"><i class="fa fa-eye"></i> View</a>';
            }
            instance.$('.right').html(controlsHtml);

            instance.laddaSubmit = Ladda.create(instance.$('.submit').get(0));
            instance.laddaSubmitDraft = Ladda.create(instance.$('.submit-draft').get(0));
            instance.laddaRemove = Ladda.create(instance.$('.remove').get(0));
        },

        renderRevisionsControls: function () {
            var instance = this;
            $('[data-collection-tostringfield]').html(instance.model.toString());
            $('[data-created]').html(humaneDate(instance.model.get(instance.config.createdField.key)));
            $('[data-updated]').html(humaneDate(instance.model.get(instance.config.updatedField.key)));

            // TODO convert revisionsModel into a collection and handle it with async events
            require([
                'views/generic/revisions/timeline',
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
            if (!(err = instance.form.validate())) {
                instance.laddaSubmit.start();
                alertify.prompt('Please, enter a revision description:', function (ok, description) {
                    if (!ok) {
                        instance.laddaSubmit.stop();
                        return;
                    }
                    if (instance.revisionsView) {
                        instance.revisionsView.pushRevision(false);
                    }
                    if (!(err = instance.form.commit())) {
                        var isNew = instance.model.isNew();
                        instance.model.save({}, {
                            silent: true,
                            url: instance.model.url() + '?description=' + encodeURIComponent(description),
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
                });
            }
        },

        submitDraft: function (event) {
            var instance = this;
            var err;
            if (!(err = instance.form.validate())) {
                instance.laddaSubmitDraft.start();
                alertify.prompt('Please, enter a revision description:', function (ok, description) {
                    if (!ok) {
                        instance.laddaSubmitDraft.stop();
                        return;
                    }
                    if (instance.revisionsView) {
                        instance.revisionsView.pushRevision(false);
                    }
                    if (!(err = instance.form.commit())) {
                        require(['models/' + instance.collectionName + '-revision', ], function (RevisionModel) {
                            var revision = new RevisionModel({ description: description, snapshot: instance.model.toJSON() });
                            revision.save({}, {
                                silent: true,
                                url: revision.urlRoot.replace(/:objectId/, instance.objectId),
                                success: function () {
                                    instance.laddaSubmitDraft.stop();
                                    alertify.success('success!');
                                        if (instance.revisionsView) {
                                            require([
                                                'json!/api/' + instance.collectionName + '/' + instance.objectId + '/revisions?t=' + Math.random()
                                                ], function (revisionsModel) {
                                                instance.revisionsView.revisionsModel = revisionsModel;
                                                instance.revisionsView.render(); // repaint view
                                                instance.revisionsView.repaintList(0); // put the mark on the current rev
                                            });
                                        }
                                        $('[data-updated]').html(humaneDate(instance.model.get(instance.config.updatedField.key)));
                                },
                                error: function () {
                                    instance.laddaSubmitDraft.stop();
                                    alertify.error('an error has ocurred! :S');
                                }
                            });
                        });
                    } else {
                        instance.laddaSubmitDraft.stop();
                        console.log('model err', err);
                        alertify.error('validation failed, look at the console for details.');
                    }
                });
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
