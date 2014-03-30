define('views/generic-form-revisions', [], function () {

    return Backbone.View.extend({

        initialize: function (options) {
            this.model = options.model;
            this.revisionsModel = options.revisionsModel;
            this.setElement($('[data-revisions-list]').get(0));
        },

        render: function () {
            var instance = this;

            instance.$el.html(_(instance.revisionsModel).map(function (rev, i) {
                return '<li><a class="restore" data-revision-i="' + i + '" href="#">'
                    + '<i class="glyphicon glyphicon-fast-backward"></i> '
                    + rev.user + ' - '  + rev.created + '</a></li>';
            }).join(''));

            instance.$('li a.restore').on('click', function (event) {
                var $button = $(this),
                    i = $button.data('revision-i'),
                    revisionModel = instance.revisionsModel[i];
                instance.model.set(revisionModel.modelSnapshot);
                event.preventDefault();
                instance.repaintList(i);
            });

            instance.repaintList(0);
        },

        repaintList: function (selectedIndex) {
            var instance = this;
            $icons = instance.$('li a.restore i');
            $icons.each(function (j, el) {
                if (j === 0) { $(el).attr('class', 'glyphicon glyphicon-fast-forward'); }
                else if (j < selectedIndex) { $(el).attr('class', 'glyphicon glyphicon-step-forward'); }
                if (j === $icons.size()-1) { $(el).attr('class', 'glyphicon glyphicon-fast-backward'); }
                else if (j > selectedIndex) { $(el).attr('class', 'glyphicon glyphicon-step-backward'); }
                if (j === selectedIndex) { $(el).attr('class', 'glyphicon glyphicon-ok'); }
            });
        },

    });

});
