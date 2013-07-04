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

            this.$el.addClass('control-group');
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
                '<button class="btn btn-danger remove-file"><i class="icon-remove"></i></button>' +
                '<div class="progress-container"></div>'
            );
            setTimeout(function () { // once appended to the DOM
                editor.$el.toggle(true);
                $('[type="file"]', editor.$el).fancyfile({
                    text  : 'Upload',
                    icon  : '',
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
                    + '"'
                    + ' class="btn"'
                    + '><i class="icon-download-alt"></i></a> '
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

                xhr.upload.onprogress = function (e) {
                    console.log(e.loaded + ' of ' + e.total);
                    $('.progress-container .bar', editor.$el).css('width', (e.loaded/(e.total||1))*100 + '%');
                };

                xhr.onload = function (xhr) {
                    var response = JSON.parse(arguments[0].currentTarget.response);
                    editor.setValue(response);
                    $('.remove-file', editor.$el).toggle(!!editor.value);
                    $('.fancy-file', editor.$el).toggle(!editor.value);
                    $('.preview', editor.$el).toggle(!!editor.value);
                    $('.progress-container', editor.$el).html('');
                    editor.repaintPreview();
                };

                var form = new FormData();
                form.append('title', this.files[0].name);
                form.append('picture', this.files[0]);
                xhr.send(form);
                $('.progress-container', editor.$el).html(
                    '<div class="progress progress-striped active">' +
                    '   <div class="bar" style="width:0%;"></div>' +
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
 
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            // set the file object w/ObjectId
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
