(function() {


    define('jquery', [], function () {
        window.jQuery.fn.live = window.jQuery.fn.on;
        window.jQuery.browser = {};
        return window.jQuery;
    });
    Aloha.ready(function() {
        Aloha.Sidebar.right.hide();
    });

    /**
     * Backbone Forms Aloha editor
     * @author gerardobort <gerardobort@gmail.com>
     * @requires aloha editor (https://github.com/alohaeditor/Aloha-Editor/) - css , js core and plugins
     */
    Backbone.Form.editors.Aloha = Backbone.Form.editors.TextArea.extend({

        render: function() {
            var editor = this;
            editor.$el = $(editor.el);;
            editor.$el.css({ width: '70%', height: 300 });
            setTimeout(function () {
                Aloha.ready(function() {
                    editor.setValue(editor.value);
                });
            }, 200);
            return this;
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            this.$el.mahalo();
            this.value = this.$el.val();
            this.$el.aloha();
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            this.$el.mahalo();
            this.value = value;
            this.$el.val(this.value);
            this.$el.aloha();
        }

    });

}());
