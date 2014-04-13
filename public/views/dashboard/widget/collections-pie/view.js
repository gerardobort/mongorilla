define('views/dashboard/widget/collections-pie/view', [
    'text!./view.html',
    'goog!visualization,1,packages:[corechart]',
    ], function (templateHtml) {

    return Backbone.View.extend({

        events: {
        },

        initialize: function (options) {
            var instance = this;
            instance.setElement(options.el);
            instance.collectionNames = instance.$el.data('collection-names').split(',');
            var reqs = [];
            _(instance.collectionNames).each(function (collectionName) {
                reqs.push(
                    'json!/config/' + collectionName + '.json',
                    'json!/api/' + collectionName + '?ipp=0'
                );
            });

            require(reqs, function () {
                var pieData = [];
                for (var i = 0; i < arguments.length; i+=2) {
                    var config = arguments[i];
                        response = arguments[i+1];
                    pieData.push({
                        label: config.humanName,
                        value: response.pager.total_count
                    });
                }
                instance.$el.html(_.template(templateHtml, {
                    data: pieData,
                }));
                
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Content Type');
                data.addColumn('number', 'Amount');
                data.addRows(
                    _(pieData).map(function (e) { return [e.label, e.value]; })
                );

                var options = {
                    //title: 'Content Types Quick View',
                    pieHole: 0.4
                };
                var chart = new google.visualization.PieChart(instance.$('.chart').get(0));
                chart.draw(data, options);
            });
            instance.delegateEvents();
        },

        render: function () {
            var instance = this;
        },

    });

});
