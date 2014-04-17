(function() {

    /**
     * Backbone Forms CKEditor editor
     * @author gerardobort <gerardobort@gmail.com>
     * @requires ckeditor editor
     */
    Backbone.Form.editors.CKEditor = Backbone.Form.editors.TextArea.extend({

        tagName: 'div',

        render: function() {
            var editor = this;

            window.CKEDITOR.basePath = window.CKEDITOR_BASEPATH = '/third-party/ckeditor/';
            window.CKEDITOR.config.contentsCss = window.CKEDITOR.basePath + 'contents.css';

            editor.id = 'ck-' + Math.random().toString().slice(2);
            editor.$el = $(editor.el);
            editor.$el.attr('id', editor.id);
            editor.$el.css({ width: '100%', height: 'auto' });
            setTimeout(function () {
                editor.ck = CKEDITOR.appendTo(editor.id, {
                    basePath: '/third-party/ckeditor/',
                    toolbar: 'Basic',
                    skin: '../../../third-party/BootstrapCK4-Skin/skins/bootstrapck'
                }, editor.value);
            }, 200);
            return this;
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            this.value = this.ck.getData();
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            this.value = value;
            this.ck.setData(this.value);
        }

    });

}());
