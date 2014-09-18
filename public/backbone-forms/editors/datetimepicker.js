(function() {
	/**
	 * Backbone forms datetime editor
	 * @author Michael May | Ivan Mayes
	 * 
	 */

	Backbone.Form.editors.Datetimepicker = Backbone.Form.editors.Text.extend({

		tagName: 'input',

		render: function() {
			var editor = this;
            editor.id = 'datetimepicker-' + Math.random().toString().slice(2);
            editor.$el = $(editor.el);
            editor.$el.attr('id', editor.id);
            editor.$el.datetimepicker();
            editor.$el.parent().addClass('input-group date');
            editor.$el.after('<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>');

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
            this.value = this.$el.data('DateTimePicker').getDate()._d;
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            this.value = value;
            this.$el.data('DateTimePicker').setDate(new Date(this.value));
        }
	});

})();