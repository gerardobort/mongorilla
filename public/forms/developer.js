define('forms/developer', [
    'forms/developer.base',
    'models/developer',
    ], function (DeveloperFormBase, DeveloperModel) {

    Backbone.Form.Developer = DeveloperFormBase.extend({

        initialize: function () {
            var instance = this;

            alertify.success('This is a custom form with some conditional behaviors...!');
            instance.bindConditionalListeners();

            setTimeout(function () {
                instance.trigger('firstname:change', instance);
                instance.getEditor('firstname').$el
                    .attr('placeholder', 'Type something and LastName will appear...')
                    .focus();
                if (instance.model.isNew()) {
                    alertify.success('This is a Create form...!');
                } else {
                    alertify.success('This is an Edit form...!');
                }
            }, 0);

            return Backbone.Form.prototype.initialize.apply(this, arguments);
        },

        bindConditionalListeners: function (event) {
            var instance = this;

            instance.on('firstname:change', function (form, firstnameEditor, extra) {
                if (form.getEditor('firstname').getValue().trim()) {
                    form.getEditor('lastname').$el.closest('.form-group').show(600);
                } else {
                    form.getEditor('lastname').$el.closest('.form-group').hide(600);
                }
            });
        }

    });

    return Backbone.Form.Developer;

});
