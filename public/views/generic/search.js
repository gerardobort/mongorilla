define('views/generic/search', [], function () {

    return Backbone.View.extend({

        events: {
            'click .pagination > li > a': function (event) {
                var criteria = $('#fast-search-q').val();
                var page = $(event.target).data('page');
                this.search(criteria, page);
                event.preventDefault();
            }
        },

        initialize: function (options) {
            var instance = this;
            instance.collectionName = options.collectionName;

            this.setElement($('#collection-list').get(0));

            var $fastSearchQ = $('#fast-search-q');

            instance.p = 1;

            $fastSearchQ.on('keyup', function (event) {
                var criteria = $fastSearchQ.val() || '.';
                instance.search(criteria, instance.p);
            });
            $fastSearchQ.trigger('keyup');
            $fastSearchQ.get(0).focus();
        },

        search: function (criteria, p) {
            var instance = this;
            criteria = criteria || '';
            p = p || 1;
            require([
                'json!/config/' + instance.collectionName + '.json',
                'json!/api/search/' + instance.collectionName + '?q=' + criteria + '&p=' + p
                ], function (config, response) {

                instance.$el.html('<table class="table table-striped"><thead></thead><tbody></tbody></table><div class="box-footer clearfix"></div>');
                instance.$('thead').prepend(
                        '<tr><th>#</th>' 
                        + response.columns.map(function (col, i) {
                            return '<th>' + response.columnsHumanNames[i] + '</th>'; 
                        }) 
                        + '<th>actions</th></tr>'
                );
                instance.$('tbody').append(
                    _(response.data).map(function (result, i) {
                        return '<tr><td>' + (response.ipp * (response.p-1) + i+1) + '</td>' 
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
                instance.renderPager(response);
            });
        },

        renderPager: function (response) {
            var instance = this;

            var html = '';
            html += '<div class="pull-left"> &nbsp; showing <strong>' + response.count + '</strong> of <strong>' + response.total_count + '</strong> results</div>';
            html += '<ul class="pagination pagination-sm no-margin pull-right">';
            if (3 < response.p ) {
                html += '<li><a href="#" data-page="1">1</a></li>';
                html += '<li><a disabled="disabled">...</a></li>';
            }
            for (var p = (response.p < 3 ? 3 - response.p : response.p-2); p < response.p; p++) {
                html += '<li><a href="#" data-page="' + p + '">' + p + '</a></li>';
            }
            html += '<li><a href="#" data-page="' + response.p + '" class="bg-blue">' + response.p + '</a></li>';
            for (var p = response.p+1; p < (response.total_pages - (response.p+1) < 2 ? response.total_pages+1 : response.p+3); p++) {
                html += '<li><a href="#" data-page="' + p + '">' + p + '</a></li>';
            }
            if (response.total_pages-3 > response.p) {
                html += '<li><a disabled="disabled">...</a></li>';
                html += '<li><a href="#" data-page="' + response.total_pages + '">' + response.total_pages + '</a></li>';
            }
            html += '</ul>';

            instance.$('.box-footer').html(html);
            instance.delegateEvents();
        }

    });

});
