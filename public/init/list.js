define('init/list', [], function () {

    var $collectionList = $('#collection-list'),
        $fastSearchQ = $('#fast-search-q');

    if ($collectionList.size() && $fastSearchQ.size()) {
        var collectionName = $collectionList.data('collection-name');

        $fastSearchQ.on('keyup', function (event) {
            var criteria = $fastSearchQ.val() || '.';
            require([
                'json!/config/' + collectionName + '.json',
                'json!/api/search/' + collectionName + '?q=' + criteria
                ], function (config, response) {

                $collectionList.html('<table class="table table-striped"><thead></thead><tbody></tbody></table>');
                $('thead', $collectionList).prepend(
                        '<tr><th>#</th>' 
                        + response.columns.map(function (col, i) {
                            return '<th>' + response.columnsHumanNames[i] + '</th>'; 
                        }) 
                        + '<th>actions</th></tr>'
                );
                $('tbody', $collectionList).append(
                    _(response.data).map(function (result, i) {
                        return '<tr><td>' + (i+1) + '</td>' 
                            + response.columns.map(function (col) {
                                if (config.createdField.key === col || config.updatedField.key === col) {
                                    return '<td datetime="' + result[col] + '">' + humaneDate(result[col]) + '</td>';
                                }
                                return '<td>' + result[col] + '</td>';
                            })
                            + '<td>'
                            + '<a class="btn" href="/edit/' + collectionName+ '/' + result['_id'] + '"><i class="glyphicon glyphicon-edit"></i></a>'
                            + '<a class="btn" href="/preview/' + collectionName+ '/' + result['_id'] + '" target="_blank" ><i class="glyphicon glyphicon-eye-open"></i></a>'
                            + '</td></tr>'
                    }).join('')
                );

            });
        });
        $fastSearchQ.trigger('keyup');
        $fastSearchQ.get(0).focus();
    }

});
