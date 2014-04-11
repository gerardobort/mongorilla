define('views/generic/search', [], function () {

    return Backbone.View.extend({

        initialize: function (options) {
            var instance = this;
            instance.collectionName = options.collectionName;

            this.setElement($('#collection-list').get(0));

            var $fastSearchQ = $('#fast-search-q');

            $fastSearchQ.on('keyup', function (event) {
                var criteria = $fastSearchQ.val() || '.';
                require([
                    'json!/config/' + instance.collectionName + '.json',
                    'json!/api/search/' + instance.collectionName + '?q=' + criteria
                    ], function (config, response) {

                    instance.$el.html('<table class="table table-striped"><thead></thead><tbody></tbody></table>');
                    instance.$('thead').prepend(
                            '<tr><th>#</th>' 
                            + response.columns.map(function (col, i) {
                                return '<th>' + response.columnsHumanNames[i] + '</th>'; 
                            }) 
                            + '<th>actions</th></tr>'
                    );
                    instance.$('tbody').append(
                        _(response.data).map(function (result, i) {
                            return '<tr><td>' + (i+1) + '</td>' 
                                + response.columns.map(function (col) {
                                    if (config.createdField.key === col || config.updatedField.key === col) {
                                        return '<td datetime="' + result[col] + '">' + humaneDate(result[col]) + '</td>';
                                    }
                                    return '<td>' + result[col] + '</td>';
                                })
                                + '<td>'
                                + '<div class="btn-group"><a class="btn btn-default btn-small" href="/edit/' + instance.collectionName+ '/' + result['_id'] + '"><i class="glyphicon glyphicon-edit"></i></a>'
                                + ' <a class="btn btn-default btn-small" href="/preview/' + instance.collectionName+ '/' + result['_id'] + '" target="_blank" ><i class="glyphicon glyphicon-eye-open"></i></a></div>'
                                + '</td></tr>'
                        }).join('')
                    );

                });
            });
            $fastSearchQ.trigger('keyup');
            $fastSearchQ.get(0).focus();
        },

    });

});
