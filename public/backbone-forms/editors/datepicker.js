(function() {

    /**
     * Backbone Forms Datepicker editor
     * @author gerardobort <gerardobort@gmail.com>
     * @requires bootstrap-datepicker
     */
    Backbone.Form.editors.Datepicker = Backbone.Form.editors.Text.extend({

        tagName: 'input',

        render: function() {
            var editor = this;
            editor.id = 'datepicker-' + Math.random().toString().slice(2);
            editor.$el = $(editor.el);
            editor.$el.attr('id', editor.id);
            setTimeout(function() {
                editor.$el.parent().addClass('input-group date');
                editor.$el.after('<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>');
            }, 200);
            editor.$el.datepicker({
                format: (this.schema.editorAttrs||{}).format || 'yyyy-mm-dd'
            });

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

            if (this.value) {
                this.setValue(this.value);
            }
            return this;
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            this.value = this.$el.datepicker('getUTCDate');
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            this.value = value;
            this.$el.datepicker('setUTCDate', new Date(this.value));
        }

    });

}());
