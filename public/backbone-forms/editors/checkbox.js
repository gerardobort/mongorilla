(function() {

    /**
     * Backbone Forms Checkbox boolean editor
     * @author gerardobort <gerardobort@gmail.com>
     */
    Backbone.Form.editors.Checkbox = Backbone.Form.editors.Base.extend({

        tagName: 'div',
        
        defaultValue: '',
        
        initialize: function(options) {

            var instance = this;

            setTimeout(function(){
                instance.$el.append('<input type="checkbox" />')
                instance.setValue( instance.model.get(options.key) );
            },1);

        },

        /**
         * Adds the editor to the DOM
         */
        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            var value = this.$('input[type="checkbox"]').prop('checked');
            return value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            this.$('input[type="checkbox"]').prop('checked', !!value);
        },

    });

}());
