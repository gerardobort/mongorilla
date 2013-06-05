require.config({
    baseUrl: "/",
    map: {
        '*': {
            text: '/lib/require/require-text.js',
            css: '/lib/require/require-css.js',
            json: '/lib/require/require-json.js'
        }
    }
});


String.prototype.toCamelCase = function () {
    return this.split(/\W+/g).map(function (w) {
        return w.substr(0, 1).toUpperCase() + w.substr(1); 
    }).join(' ');
}

require(['init/backbone'], function (Backbone) {

    console.log('Mongorila satrted!');

    // TODO move this
    
    var $collectionForm = $('#collection-form');
    if ($collectionForm.size()) {
        var collectionName = $collectionForm.data('collection-name');

        require(['model/' + collectionName, 'form/' + collectionName, 'json!config/' + collectionName + '.json'], function (Model, Form, config) {

            var model = new Model(),
                form = new Form({ model: model, fieldsets: config.fieldsets });

            $collectionForm.html(form.render().$el);
            $collectionForm.append(
                '<button class="btn btn-primary btn-large submit">' + (model.id ? 'Save' : 'Create') + '</button>'
            );

            $('.submit', $collectionForm).on('click', function () {
                var err;
                if (!(err = form.commit())) {
                    console.log('model submitted', form.model);
                    alert('validation passed, look at the console for details.');
                } else {
                    console.log('model err', err);
                    alert('validation failed, look at the console for details.');
                }
            });

        });
    }

});
