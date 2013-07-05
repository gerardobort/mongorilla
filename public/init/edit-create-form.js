define('init/edit-create-form', [], function () {

    var $collectionForm = $('#collection-form');
    if ($collectionForm.size()) {
        var collectionName = $collectionForm.data('collection-name'),
            objectId = $collectionForm.data('object-id') || 'default';

        require([
            'model/' + collectionName, 
            'form/' + collectionName,
            'json!/config/' + collectionName + '.json',
            'json!/api/' + collectionName + '/' + objectId
            ], function (Model, Form, config, modelData) {


            var model = new Model(modelData),
                form = new Form({ model: model, fieldsets: config.fieldsets, schema: Form.prototype.schema }); // force the schema against the model one

            $('[data-collection-name]').html(model.toString());

            $collectionForm.html(form.render().$el);


            // save, cancel
            $collectionForm.append(
                '<div class="row">'
                + '<div class="offset6 span2">' + (model.id ? '<button class="btn btn-danger btn-large remove">Delete</button>' : '') + '</div>'
                + '<div class="span2"><button class="btn btn-primary btn-large submit">' + (model.id ? 'Save' : 'Create') + '</button></div>'
                + (!model.isNew() ?
'<div class="span2"><a class="btn btn-info btn-large preview" href="/preview/' + collectionName + '/' + model.id + '" target="_blank" >Preview</a></div>'
                    : '')
                + '</div><div class="row">...</div>'
            );

            if (!$collectionForm.data('readonly')) {
                $('.submit', $collectionForm).on('click', function () {
                    var err;
                    if (!(err = form.commit())) {
                        console.log('model submitted', form.model.toJSON());
                        var isNew = model.isNew();
                        model.save({}, {
                            success: function () {
                                alert('success!');
                                if (isNew) {
                                    document.location.href = '/edit/' + collectionName + '/' + model.id;
                                }
                            }
                        });
                    } else {
                        console.log('model err', err);
                        alert('validation failed, look at the console for details.');
                    }
                });

                $('.remove', $collectionForm).on('click', function () {
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
