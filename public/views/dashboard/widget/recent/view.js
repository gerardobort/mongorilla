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
            require([
                'json!/config/' + instance.collectionName + '.json',
                'collections/' + instance.collectionName
                ], function (config, Collection) {
                    instance.config = config;
                    instance.pager = {
                        p: 1,
                        ipp: 5,
                        'sort[]': (function (map) {
                            map[ config.updatedField.key ] = -1;
                            return $.param(map);
                        })({}),
                    };
                    instance.collection = new Collection();
                    instance.collection.fetch({
                        data: instance.pager,
                        success: function () {
                            instance.onCollecitonFetchSucces.apply(instance, arguments);
                        }
                    });
            });
            instance.delegateEvents();
        },

        render: function () {
            var instance = this;
        },

        gotoPage: function (event) {
            var instance = this;
                $el = $(event.target);
            if ($el.data('pager')) {
                var pager = $el.data('pager'),
                    data = {
                        p: pager.p,
                        ipp: instance.pager.ipp,
                        filter: instance.pager.filter,
                        'sort[]': instance.pager['sort[]'],
                    };
                instance.collection.fetch({ data: data });
            } else {
                instance.collection.fetch({ url: $(event.target).attr('href') });
            }
            event.preventDefault();
        },

        onCollecitonFetchSucces: function (response, collection, xhr) {
            var instance = this;
            instance.$el.html(_.template(templateHtml, {
                config: instance.config,
                collection: collection,
                pager: collection.pager
            }));
            instance.$('time').humaneDates({ lowercase: true});
        }

    });

});
