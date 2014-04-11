define('views/dashboard/widget/recent/view', [
    'text!./view.html'
    ], function (templateHtml) {

    return Backbone.View.extend({

        events: {
            'click .pagination li a': 'gotoPage'
        },

        initialize: function (options) {
            var instance = this;
            instance.setElement(options.el);
            instance.collectionName = instance.$el.data('collection-name');
            instance.p = 1;
            require([
                'json!/config/' + instance.collectionName + '.json',
                'collections/' + instance.collectionName
                ], function (config, Collection) {
                    instance.collection = new Collection();
                    instance.collection.on('add', function (response, collection, xhr) {
                        instance.$el.html(_.template(templateHtml, {
                            config: config,
                            collection: collection,
                            pager: collection.pager
                        }));
                    }, this);
                    instance.collection.fetch({ data: { ipp: 5, p: instance.p } });
            });
            instance.delegateEvents();
        },

        render: function () {
            var instance = this;
        },

        gotoPage: function (event) {
            var instance = this;
            instance.collection.fetch({ url: $(event.target).attr('href') });
            event.preventDefault();
        },

    });

});
