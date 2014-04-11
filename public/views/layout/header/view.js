define('views/layout/header/view', [], function () {

    return Backbone.View.extend({

        events: {
        },

        initialize: function (options) {
            var instance = this;
            $('a[href="/auth/logout"]').on('click', function (event) {
                $.ajax({ method: 'POST', url: '/auth/logout' })
                    .success(function () { document.location.href = '/'; })
                    .error(function () { alertify.error('Ooops!') });
                event.preventDefault();
            });
        },

        render: function () {
            var instance = this;
        },

    });

});
