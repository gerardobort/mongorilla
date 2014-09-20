(function() {
	/**
	 * Backbone forms colorpicker editor
	 * @author Michael May | Ivan Mayes
	 * 
	 */

	Backbone.Form.editors.Colorpicker = Backbone.Form.editors.Text.extend({

		tagName: 'input',

		render: function() {
			var editor = this;
			editor.id = 'colorpicker-' + Math.random().toString().slice(2);
			editor.$el = $(editor.el);
			editor.$el.attr('id', editor.id);
			editor.$el.attr('data-color-format', 'hex');
			editor.$el.colorpicker();

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
            this.value = this.$el.val();
            return this.value;
        },

        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            this.value = value;
            this.$el.val(this.value);
        }
	});

})();