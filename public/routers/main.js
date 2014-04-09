define('routers/main', [
        'mongorilla-spinner',
        '/third-party/ladda-bootstrap/dist/ladda.min.js',
    ], function (spinner, Ladda) {

    return Backbone.Router.extend({

        routes: {
            'auth/login': 'loginForm',
            'add/:collectionName': 'createForm',
            'edit/:collectionName/:objectId': 'editForm',
            'search/:collectionName': 'searchForm',
        },

        initialize: function () {
            $('a[href="/auth/logout"]').on('click', function (event) {
                $.ajax({ method: 'POST', url: '/auth/logout' })
                    .success(function () { document.location.href = '/'; })
                    .error(function () { alertify.error('Ooops!') });
                event.preventDefault();
            });
            $('.sidebar input[name="q"').on('keydown', function (event) {
                if (13 === event.keyCode) {
                    event.preventDefault();
                }
            });
            $('.sidebar input[name="q"').on('keyup', function (event) {
                var q = $(this).val(),
                    $as = $('.sidebar-menu a');

                if ('' === q) {
                    // reset highlighting
                    $as.each(function (i, a) {
                        var $a = $(a);
                        if ($a.find('.pull-right').size()) {
                            return;
                        }
                        $a.closest('li.treeview').removeClass('active').show().find('.treeview-menu').hide();
                        $a.closest('li.treeview').find('i.fa.pull-right').removeClass('fa-angle-down').addClass('fa-angle-left');
                        $a.show();
                        $a.removeClass('bg-green');
                    });
                    return;
                }

                // hide all by default
                $as.each(function (i, a) {
                    var $a = $(a),
                        text = $a.text();
                    if ($a.find('.pull-right').size()) {
                        return;
                    }
                    $a.closest('li.treeview').removeClass('active').hide().find('.treeview-menu').hide();
                    $a.closest('li.treeview').find('i.fa.pull-right').removeClass('fa-angle-down').addClass('fa-angle-left');
                    $a.hide();
                    $a.removeClass('bg-green');
                });

                // show and highlight
                $as.each(function (i, a) {
                    var $a = $(a),
                        text = $a.text();
                    if ($a.find('.pull-right').size()) {
                        return;
                    }
                    if (text.match(new RegExp('(' + q.split(' ').join('|') + ')', 'i'))) {
                        $a.closest('li.treeview').addClass('active').show().find('.treeview-menu').show();
                        $a.closest('li.treeview').find('i.fa.pull-right').removeClass('fa-angle-left').addClass('fa-angle-down');
                        $a.show();
                        $a.addClass('bg-green');
                    }
                });
                event.preventDefault();
            });
            console.log('Mongorilla!');
        },

        loginForm: function (collectionName) {
            require(['views/login-form'], function (LoginFormView) {
                var form = new LoginFormView();
            });
        },

        createForm: function (collectionName) {
            spinner.spin($('#collection-form').get(0))
            require(['views/generic-form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName });
            });
        },

        editForm: function (collectionName, objectId) {
            spinner.spin($('#collection-form').get(0))
            require(['views/generic-form'], function (GenericFormView) {
                var form = new GenericFormView({ collectionName: collectionName, objectId: objectId });
            });
        },

        searchForm: function (collectionName) {
            spinner.spin($('#collection-list').get(0))
            require(['views/generic-search'], function (SearchFormView) {
                var form = new SearchFormView({ collectionName: collectionName });
            });
        },

    });

});
