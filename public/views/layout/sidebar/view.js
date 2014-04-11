define('views/layout/sidebar/view', [], function () {

    return Backbone.View.extend({

        events: {
        },

        initialize: function (options) {
            var instance = this;

            var $sidebarQInput = $('.sidebar input[name="q"]');
            $sidebarQInput.size() && $sidebarQInput.get(0).focus();
            $sidebarQInput.on('keydown', function (event) {
                if (13 === event.keyCode) {
                    event.preventDefault();
                }
            });
            $sidebarQInput.on('keyup', function (event) {
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
        },

        render: function () {
            var instance = this;
        },

    });

});
