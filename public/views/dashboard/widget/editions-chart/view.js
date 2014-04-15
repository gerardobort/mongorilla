define('views/dashboard/widget/editions-chart/view', [
    'text!./view.html',
    'goog!visualization,1,packages:[corechart]',
    ], function (templateHtml) {

    return Backbone.View.extend({

        events: {
        },

        initialize: function (options) {
            var instance = this;
            instance.setElement(options.el);
            require([
                    'json!/api/revision' + '?ipp=30&sort[]=created=-1'
                ], function (response) {
                var pieData = {};
                for (var i = 0; i < response.data.length; i++) {
                    var rev = response.data[i],
                        step = ((new Date(rev.created)).toDateString()),
                        data = {
                            label: rev.user + ' edited ' + rev.collectionName,
                            created: rev.created,
                            step: step,
                            is_draft: rev.is_draft,
                            first_revision: rev.first_revision,
                        };

                    if (pieData[step]) {
                        pieData[step].push(data);
                    } else {
                        pieData[step] = [data];
                    }
                }
                instance.$el.html(_.template(templateHtml, {
                    data: pieData,
                }));
                
                var data = new google.visualization.DataTable();
                data.addColumn('date', 'Day');
                data.addColumn('number', 'drafts');
                data.addColumn('number', 'editions');
                data.addColumn('number', 'creations');
                data.addRows(
                    _(pieData).map(function (stepData) {
                        return [
                            new Date(stepData[0].step),
                            _(stepData).filter(function (r) { return r.is_draft; }).length,
                            _(stepData).filter(function (r) { return !r.first_revision; }).length,
                            _(stepData).filter(function (r) { return r.first_revision; }).length,
                        ];
                    })
                );
                var options = {
                    title: 'Latest Editions',
                    crosshair: {
                        trigger: 'both',
                        orientation: 'vertical',
                        color: '#999',
                        opacity: 0.2,
                        focused: { color: '#999', opacity: 0.4 },
                    }
                };
                var chart = new google.visualization.LineChart(instance.$('.chart').get(0));
                chart.draw(data, options);
            });
            instance.delegateEvents();
        },

        render: function () {
            var instance = this;
        },

    });

});
