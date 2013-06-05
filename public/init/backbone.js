define('init/backbone', [], function () {

    Backbone.Form.editors.Base.prototype._initialize = Backbone.Form.editors.Base.prototype.initialize;
    Backbone.Form.editors.Base.prototype.initialize = function(options) {
        Backbone.Form.editors.Base.prototype._initialize.call(this, options);
        // this patch adds compatibility between backbone-forms and backbone-relational libraries
        if (options.model instanceof Backbone.RelationalModel && options.model.get(options.key) instanceof Backbone.Collection) {
            this.value = options.model.get(options.key).toJSON();
        }   
    };

    return Backbone;

});
