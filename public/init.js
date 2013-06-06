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

    console.log('Mongorilla satrted!');

    // TODO move this
    
    var $collectionForm = $('#collection-form');
    if ($collectionForm.size()) {
        var collectionName = $collectionForm.data('collection-name'),
            objectId = $collectionForm.data('object-id') || 'default';

        require([
            'model/' + collectionName, 
            'form/' + collectionName,
            'json!/config/' + collectionName + '.json',
            'json!/api/' + collectionName + '/' + objectId
            ], function (Model, Form, config, modelData) {


            var model = new Model(modelData),
                form = new Form({ model: model, fieldsets: config.fieldsets, schema: Form.prototype.schema }); // force the schema against the model one

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

    var $collectionList = $('#collection-list'),
        $fastSearchQ = $('#fast-search-q');

    if ($collectionList.size() && $fastSearchQ.size()) {
        var collectionName = $collectionList.data('collection-name');

        $fastSearchQ.on('keyup', function (event) {
            var criteria = $fastSearchQ.val() || '.';
            require(['json!/api/search/' + collectionName + '?q=' + criteria], function (response) {

                $collectionList.html('<table class="table table-striped"><thead></thead><tbody></tbody></table>');
                $('thead', $collectionList).prepend(
                        '<tr><th>#</th>' 
                        + response.columns.map(function (col) { return '<th>' + col + '</th>'; }) 
                        + '<th>actions</th></tr>'
                );
                $('tbody', $collectionList).append(
                    _(response.data).map(function (result, i) {
                        return '<tr><td>' + (i+1) + '</td>' 
                            + response.columns.map(function (col) { return '<td>' + result[col] + '</td>'; })
                            + '<td><a class="btn" href="/edit/' + collectionName+ '/' + result['_id'] + '"><i class="icon-edit"></i></a></td></tr>'
                    }).join('')
                );

            });
        });
        $fastSearchQ.trigger('keyup');
        $fastSearchQ.get(0).focus();
    }

});
