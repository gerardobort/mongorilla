define('forms/mongorillaUser', [
    'forms/mongorillaUser.base',
    'models/mongorillaUser'
    ], function (MongorillaUserFormBase, MongorillaUserModel) {

    Backbone.Form.MongorillaUser = MongorillaUserFormBase.extend({

        events: {
        },

        initialize: function () {
            var instance = this;

            setTimeout(function () {
                var warning = '\
                    <div class="alert alert-warning alert-dismissable diff-report">\
                        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>\
                        <h3><strong>Warning!</strong> <code>Mongorilla User</code> is currently an experimental feature.</h3>\
                        <p>We don\'t guarantee future support yet, since this is now subject to testing and approval.</p>\
                    </div>\
                ';
                $('#main-container').prepend(warning);
            }, 0);
            return Backbone.Form.prototype.initialize.apply(this, arguments);
        },


    });

    return Backbone.Form.MongorillaUser;

});
