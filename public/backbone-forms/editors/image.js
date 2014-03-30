(function() {

    /**
     * Backbone Forms File editor
     * @author gerardobort <gerardobort@gmail.com>
     * @requires fancy-file
     */
    Backbone.Form.editors.Image = Backbone.Form.editors.Base.extend({

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

            this.$el.removeClass('form-control');
            editor.options = options;
            _.extend(editor, _.pick(options, 'key', 'form'));
            var schema = editor.schema = options.schema || {};
            editor.validators = options.validators || schema.validators;

            // taken from: https://developer.mozilla.org/en-US/docs/Web/API/FileReader?redirectlocale=en-US&redirectslug=DOM%2FFileReader#readAsDataURL%28%29
            this.oFReader = new FileReader();
            this.rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            var editor = this;
            editor.$el.css({ width: 290, display: 'block' });
            editor.$el.toggle(false);
            editor.$el.html(
                '<img src="" class="image-preview img-thumbnail" style="display:block;max-height:300px;" />' + 
                '<input name="upload" type="file" data-toggle="fancyfile" />' +
                '<button class="btn btn-danger remove-file"><i class="glyphicon glyphicon-remove"></i></button>' +
                '<div class="progress-container"></div>'
            );
            setTimeout(function () { // once appended to the DOM
                editor.$el.toggle(true);
                $('[type="file"]', editor.$el).fancyfile({
                    text  : 'Upload',
                    icon  : '',
                    style : 'btn-info',
                    placeholder : 'Select Image…'
                });
                $('.fancy-file', editor.$el).toggle(!editor.value);
                $('.remove-file', editor.$el).toggle(!!editor.value);
                $('.image-preview', editor.$el).toggle(!!editor.value);
            }, 200)
            if (editor.value) {
                if ('object' === typeof editor.value) {
                    $('.image-preview', editor.$el).attr('src', '/api/fs.files/' + editor.value._id + '/raw');
                } else {
                    $('.image-preview', editor.$el).attr('src', '/api/fs.files/' + editor.value + '/raw');
                }
            }
            this._delegateEvents();

            return this;
        },

        _delegateEvents: function () {
            var editor = this;

            editor.oFReader.onload = function (oFREvent) {
                $('.image-preview', editor.$el).one('load', function () {
                    $('.image-preview', editor.$el).toggle(true);
                });
                $('.image-preview', editor.$el).attr('src', oFREvent.target.result);
            };
 
            $('[type="file"]', editor.$el).on('change', function (event) {
                if (this.files.length === 0) { return; }
                var oFile = this.files[0];
                // only in the case of images... TODO
                if (!editor.rFilter.test(oFile.type)) { alert("You must select a valid image file!"); return; }

                editor.oFReader.readAsDataURL(oFile);

                //---
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/fs.files');

                xhr.upload.onprogress = function (e) {
                    console.log(e.loaded + ' of ' + e.total);
                    var percent = (e.loaded/(e.total||1))*100 + '%';
                    $('.progress-container .progress-bar', editor.$el)
                        .css('width', percent)
                        .text('Uploading... ' + percent);
                };

                xhr.onload = function (xhr) {
                    var response = JSON.parse(arguments[0].currentTarget.response);
                    editor.setValue(response.data[0]);
                    $('.remove-file', editor.$el).toggle(!!editor.value);
                    $('.fancy-file', editor.$el).toggle(!editor.value);
                    $('.image-preview', editor.$el).toggle(!!editor.value);
                    $('.progress-container', editor.$el).html('');
                };

                var form = new FormData();
                var collectionName = $('#collection-form').data('collection-name'); // TODO get this var in a better manner
                form.append(collectionName + '.' + editor.options.key, this.files[0]);
                xhr.send(form);
                $('.progress-container', editor.$el).html(
                    '<div class="progress progress-striped">' +
                    '   <div class="progress-bar" style="width:0%;"></div>' +
                    '</div>'
                );
                //---
            });

            $('.remove-file', editor.$el).on('click', function (event) {
                event.preventDefault();
                if (confirm('Are you sure you want to remove this file?')) {
                    $.ajax({
                        url: '/api/fs.files/' + editor.value._id,
                        method: 'DELETE'
                    })
                    .success(function () {
                        editor.setValue(null);
                        //$('[type="file"]', editor.$el).val();
                        $('.image-preview', editor.$el).attr('src', 'about:blank');
                        $('.remove-file', editor.$el).toggle(!!editor.value);
                        $('.fancy-file', editor.$el).toggle(!editor.value);
                        $('.image-preview', editor.$el).toggle(!!editor.value);
                    })
                    .error(function () {
                        alert('An error has occurred.');
                    })
                }
            });
 
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            // set the file object w/ObjectId
            if ('object' === typeof this.value) {
                return this.value._id;
            }
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            // set the file object w/ObjectId
            this.value = value;
        },

        focus: function () {
            $('[type="file"]', this.$el).get(0).focus();
        }

    });

}());