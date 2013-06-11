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


            // files - temporal - this is only experimental yet
            //-----------------------
            $collectionForm.append(
                '<img src="" id="uploadPreview" style="width:100px;height:100px;">' + 
                '<input name="upload" type="file" data-toggle="fancyfile" data-placeholder="Select a file..." data-text="Uplaod">'
            );
            $('[type="file"]', $collectionForm).fancyfile({});
            // example from: https://developer.mozilla.org/en-US/docs/Web/API/FileReader?redirectlocale=en-US&redirectslug=DOM%2FFileReader#readAsDataURL%28%29
            var oFReader = new FileReader(), rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
 
            oFReader.onload = function (oFREvent) {
                $('#uploadPreview', $collectionForm).attr('src', oFREvent.target.result);
            };
            //-----------------------
 
            $('[type="file"]', $collectionForm).on('change', function (event) {
                if (this.files.length === 0) { return; }
                var oFile = this.files[0];
                if (!rFilter.test(oFile.type)) { alert("You must select a valid image file!"); return; }
                oFReader.readAsDataURL(oFile);

                //---
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/file');

                xhr.upload.onprogress = function(e) 
                {
                     console.log(e.loaded + ' of ' + e.total);
                };

                xhr.onload = function()
                {
                    alert('upload complete');
                };

                var form = new FormData();
                form.append('title', this.files[0].name);
                form.append('picture', this.files[0]);

                xhr.send(form);
                //---
            });


            // save, cancel
            $collectionForm.append(
                '<button class="btn btn-primary btn-large submit">' + (model.id ? 'Save' : 'Create') + '</button>'
                + (model.id ? '<button class="btn btn-danger btn-large remove">Delete</button>' : '')
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

            $(document).delegate('input[data-autocomplete-collection-name]', 'focus', function (e) {
                var $field = $(this),
                    fieldName = $field.data('autocomplete-field').toString(),
                    dataCache = {};

                if ($field.data('typeahead')) {
                    return;
                }
                $field.on('change', function () {
                    var $this = $(this);
                    setTimeout(function () {
                        var res = dataCache[$this.val()];
                        $this.closest('fieldset').find('[name="_id"]').val(res._id);
                    }, 200); // this is to avoid the delay since clicking until the value is set
                });
                $field.typeahead({
                    ajax: {
                        url: '/api/search/' + $field.data('autocomplete-collection-name').toString(),
                        timeout: 300,
                        displayField: 'endpoint',
                        triggerLength: 1,
                        method: 'get',
                        loadingClass: "loading-circle",
                        preDispatch: function (query) {
                            return {
                                q: query
                            }
                        },
                        preProcess: function (data) {
                            dataCache = {};
                            var results = _(data.data).map(function (res) {
                                dataCache[res[fieldName]] = res;
                                return {
                                    name: res[fieldName],
                                    _id: res._id
                                };
                            });
console.log(dataCache)
                            return results;
                        }
                    }
                });
            });

        });
    }

});
