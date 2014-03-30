define('views/generic-form', [
        '/third-party/backbone-deep-model/distribution/deep-model.min.js',
        '/third-party/backbone-forms/distribution/backbone-forms.min.js',
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

    var $collectionForm = $('#collection-form');
    var $formControls = $('#form-controls');
    if ($collectionForm.size()) {
        var collectionName = $collectionForm.data('collection-name'),
            objectId = $collectionForm.data('object-id') || 'default';

        require([
            'model/' + collectionName, 
            'form/' + collectionName,
            'json!/config/' + collectionName + '.json',
            'json!/api/' + collectionName + '/' + objectId,
            ], function (Model, Form, config, modelData) {


            var model = new Model(modelData),
                form = new Form({ model: model, fieldsets: config.fieldsets, schema: Form.prototype.schema }); // force the schema against the model one

            $('[data-collection-name]').html(model.toString());
            $('[data-created]').html(humaneDate(model.get(config.createdField.key)));
            $('[data-updated]').html(humaneDate(model.get(config.updatedField.key)));


            $collectionForm.html(form.render().$el);


            // save, cancel
            $formControls.html(
                '' + (model.id && $('[data-permission-d]').size() ? '<button class="btn btn-danger btn-lg remove">Delete</button>' : '') + '</div>'
                + ($('[data-permission-u], [data-permission-c]').size() ? '<button class="btn btn-primary btn-lg submit">' + (model.id ? 'Save' : 'Create') + '</button>' : '')
                + (!model.isNew() ?
'<a class="btn btn-info btn-lg preview" href="/preview/' + collectionName + '/' + model.id + '" target="_blank" >Preview</a>'
                    : '')
            );


            _(config.schema).each(function (schema, prop) {
                model.on('change:' + prop, function(model, val) {
                    var obj = {};
                    if (config.schema[prop].type === 'Date') {
                        val = new Date(val);
                    }
                    obj[prop] = val;
                    form.setValue(obj);
                });
            });

            var revisionsView;
            // only edit form
            if (objectId !== 'default') {
                // TODO convert revisionsModel into a collection and handle it with async events
                require([
                    'views/edit-form-revisions',
                    'json!/api/' + collectionName + '/' + objectId + '/revisions?t=' + Math.random()
                    ], function (RevisionsView, revisionsModel) {

                    revisionsView = new RevisionsView({ model: model, revisionsModel: revisionsModel });
                    revisionsView.render();
                });
            }

            if (!$collectionForm.data('readonly')) {
                $('.submit', $formControls).on('click', function () {
                    var err;
                    if (!(err = form.commit())) {
                        console.log('model submitted', form.model.toJSON());
                        var isNew = model.isNew();
                        model.save({}, {
                            success: function () {
                                alert('success!');
                                if (isNew) {
                                    document.location.href = '/edit/' + collectionName + '/' + model.id;
                                } else {
                                    revisionsView && revisionsView.render(); // repaint view
                                    $('[data-updated]').html(humaneDate(model.get(config.updatedField.key)));
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
                });

                $('.remove', $formControls).on('click', function () {
                    if (confirm('Are you sure you want to delete this '+ collectionName)) {
                        model.destroy({
                            success: function () {
                                document.location.href = '/search/' + collectionName;
                            }
                        });
                    }
                });

            } else {
                $('.submit, .remove', $collectionForm).attr('disabled', 'disabled');
            }

        });

    }

});
