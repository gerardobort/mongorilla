define('init/list', [], function () {

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
                        + response.columns.map(function (col, i) {
                            return '<th>' + response.columnsHumanNames[i] + '</th>'; 
                        }) 
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
