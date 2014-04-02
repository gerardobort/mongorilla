define('routers/main', ['mongorilla-spinner'], function (spinner) {

    return Backbone.Router.extend({

        routes: {
            'auth/login': 'loginForm',
            'add/:collectionName': 'createForm',
            'edit/:collectionName/:objectId': 'editForm',
            'search/:collectionName': 'searchForm',
        },

        initialize: function () {
            console.log('Mongorilla!');
        },

        loginForm: function (collectionName) {
            var $form = $('form');
            $form.find('[type="submit"]').removeAttr('disabled');
            $form.submit(function (event) {   
                event.preventDefault();
                $.ajax({
                        method: 'POST',
                        url: $form.attr('action'),
                        data: $form.serialize()
                    })
                    .success(function (data) {
                        alertify.success('<i class="glyphicon glyphicon-ok"></i> <span class="col-sm-offset-1">Welcome, <strong>' + data.user.username + '</strong></span>!');
                        $form.fadeOut(1000, function () {
                            document.location = '/dashboard';
                        });
                    })
                    .error(function (data) {
                        $('form .alert').remove();
                        $('form').prepend('<div class="alert alert-danger"><i class="glyphicon glyphicon-remove"></i> Invalid credentials.</div>');
                        alertify.error('<i class="glyphicon glyphicon-remove"></i> <span class="col-sm-offset-1">Unable to perform login, please verify your credentials.</span>')
                    })
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
