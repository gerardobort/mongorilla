(function() {

    /**
     * Backbone Forms File editor
     * @author gerardobort <gerardobort@gmail.com>
     * @requires fancy-file
     */
    Backbone.Form.editors.File = Backbone.Form.editors.Base.extend({

        tagName: 'div',
        
        defaultValue: '',
        
        initialize: function(options) {
            var editor = this;

            var options = options || {};

            //Set initial value
            if (options.model) {
                if (!options.key) throw "Missing option: 'key'";

                this.model = options.model;

                // string from model
                this.value = this.model.get(options.key);
            } else if (options.value) {
                // object from list
                this.value = options.value;
            }

            this.$el.addClass('control-group fancyfile bbf-file');
            this.$el.removeClass('form-control');
            editor.options = options;
            _.extend(editor, _.pick(options, 'key', 'form'));
            var schema = editor.schema = options.schema || {};
            editor.validators = options.validators || schema.validators;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            var editor = this;
            editor.$el.toggle(false);
            editor.$el.html(
                '<span src="" class="preview"></span>' + 
                '<input name="upload" type="file" data-toggle="fancyfile" />' +
                '<button class="btn btn-danger remove-file"><i class="glyphicon glyphicon-remove"></i></button>' +
                '<div class="progress-container"></div>'
            );
            setTimeout(function () { // once appended to the DOM
                editor.$el.toggle(true);
                $('[type="file"]', editor.$el).fancyfile({
                    text  : '',
                    icon  : '<i class="glyphicon glyphicon-folder-open"></i>',
                    style : 'btn-info',
                    placeholder : 'Select File…'
                });
                $('.fancy-file', editor.$el).toggle(!editor.value);
                $('.remove-file', editor.$el).toggle(!!editor.value);
                $('.preview', editor.$el).toggle(!!editor.value);
            }, 200)
            if (editor.value) {
                editor.repaintPreview();
            }
            this._delegateEvents();

            return this;
        },

        repaintPreview: function () {
            var editor = this;
            if (editor.value) {
                $('.preview', editor.$el).html(
                    '<a target="_blank" href="/api/fs.files/'
                    + ('string' === typeof editor.value ? editor.value : editor.value._id)
                    + '/raw"'
                    + ' class="btn btn-default btn-small"'
                    + '><i class="glyphicon glyphicon-download-alt"></i></a> '
                );
            } else {
                $('.preview', editor.$el).html('');
            }
        },

        _delegateEvents: function () {
            var editor = this;
 
            $('[type="file"]', editor.$el).on('change', function (event) {
                if (this.files.length === 0) { return; }

                //---
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/fs.files');

                $('.fancy-file', editor.$el).toggle(false);
                xhr.upload.onprogress = function (e) {
                    console.log(e.loaded + ' of ' + e.total);
                    var percent = (e.loaded/(e.total||1))*100 + '%';
                    $('.progress-container .progress-bar', editor.$el)
                        .css('width', percent)
                        .text('Uploading... ' + (percent === '100%' ? '(Waiting for a response)' : percent));
                };

                xhr.onload = function (xhr) {
                    var response = JSON.parse(arguments[0].currentTarget.response);
                    editor.setValue(response.data[0]._id);
                    $('.remove-file', editor.$el).toggle(!!editor.value);
                    $('.fancy-file', editor.$el).toggle(!editor.value);
                    $('.preview', editor.$el).toggle(!!editor.value);
                    $('.progress-container', editor.$el).html('');
                    editor.repaintPreview();
                };

                var form = new FormData();
                var collectionName = $('#collection-form').data('collection-name'); // TODO get this var in a better manner
                form.append(collectionName + '.' + editor.options.key, this.files[0]);
                xhr.send(form);
                $('.progress-container', editor.$el).html(
                    '<div class="progress progress-striped active">' +
                    '   <div class="progress-bar" style="width:0%;"></div>' +
                    '</div>'
                );
                //---
            });

            $('.remove-file', editor.$el).on('click', function (event) {
                event.preventDefault();
                require(['third-party/alertify.js/lib/alertify.min'], function () {
                    alertify.confirm('Are you sure you want to remove this file?', function (ok) {
                        if (ok) {
                            $.ajax({
                                url: '/api/fs.files/' + editor.value._id,
                                method: 'DELETE'
                            })
                            .success(function () {
                                editor.setValue(null);
                                $('[type="file"]', editor.$el).val(null);
                                $('.preview', editor.$el).attr('src', 'about:blank');
                                $('.remove-file', editor.$el).toggle(!!editor.value);
                                $('.fancy-file', editor.$el).toggle(!editor.value);
                                $('.image-preview', editor.$el).toggle(!!editor.value);
                                editor.repaintPreview();
                            })
                            .error(function () {
                                alert('An error has occurred.');
                            })
                        }
                    });
                });
            });
 
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            // set the file object w/ObjectId
            if (this.value && 'object' === typeof this.value) {
                //return this.value._id;
            }
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            // set the file object w/ObjectId
            if (value && 'object' === typeof value) {
                //value = value._id;
            }
            this.value = value;
            this.render();
        },

        focus: function () {
            $('[type="file"]', this.$el).get(0).focus();
        },

        blur: function () {
            $('[type="file"]', this.$el).get(0).blur();
        }

    });

}());
