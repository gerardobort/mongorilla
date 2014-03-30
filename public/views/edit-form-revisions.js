define('views/edit-form-revisions', [
    'json!/api/' + collectionName + '/' + objectId + '/revisions?t=' + Math.random()
    ], function (modelRevisions) {

    return Backbone.Router.extend({

        init: function () {

        },

        render: function () {

            $('[data-revisions-list]').html(_(modelRevisions).map(function (rev, i) {
                return '<li><a class="restore" data-revision-i="' + i + '" href="#">'
                    + '<i class="glyphicon glyphicon-fast-backward"></i> '
                    + rev.user + ' - '  + rev.created + '</a></li>';
            }).join(''));

            $('[data-revisions-list] li a.restore').on('click', function (event) {
                var $button = $(this),
                    i = $button.data('revision-i'),
                    revisionModel = modelRevisions[i];
                model.set(revisionModel.modelSnapshot);
                event.preventDefault();
                repaintRevisionsList(i);
            });

            repaintRevisionsList(0);
        },

        repaintList: function (selectedIndex) {
            $icons = $('[data-revisions-list] li a.restore i');
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
