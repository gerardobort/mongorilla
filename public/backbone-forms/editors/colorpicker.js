(function() {
	/**
	 * Backbone forms colorpicker editor
	 * @author Michael May
	 * 
	 */

	Backbone.Form.editors.Colorpicker = Backbone.Form.editors.Text.extend({

		tagName: 'input',

		events: {
			'change': function() {
				// The 'change' event should be triggered whenever something happens
				// that affects the result of `this.getValue()`.
				this.trigger('change', this);
			},
			'focus': function() {
				// The 'focus' event should be triggered whenever an input within
				// this editor becomes the `document.activeElement`.
				this.trigger('focus', this);
				// This call automatically sets `this.hasFocus` to `true`.
			},
			'blur': function() {
				// The 'blur' event should be triggered whenever an input within
				// this editor stops being the `document.activeElement`.
				this.trigger('blur', this);
				// This call automatically sets `this.hasFocus` to `false`.
			}
		},

		initialize: function(options) {
			// Call parent constructor
			Backbone.Form.editors.Base.prototype.initialize.call(this, options);

			this.$el
				//.append('<div class="input-append color" data-color="rgb(255, 146, 180)" data-color-format="rgb"><input type="text" class="span2" value="" ><span class="add-on"><i style="background-color: rgb(255, 146, 180)"></i></span></div>')
				.colorpicker();

			console.log('color')

			// Custom setup code.
			if (this.schema.customParam) this.doSomething();
		},

		render: function() {
			this.setValue(this.value);

			return this;
		},

		getValue: function() {
			return this.$el.val();
		},

		setValue: function(value) {
			this.$el.val(value);
		},

		focus: function() {
			if (this.hasFocus) return;

			// This method call should result in an input within this edior
			// becoming the `document.activeElement`.
			// This, in turn, should result in this editor's `focus` event
			// being triggered, setting `this.hasFocus` to `true`.
			// See above for more detail.
			this.$el
				.colorpicker('place')
				.colorpicker('show')
				.focus();
		},

		blur: function() {
			if (!this.hasFocus) return;

			this.$el.blur();
		}
	});

})();