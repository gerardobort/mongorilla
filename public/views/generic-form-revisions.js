define('views/generic-form-revisions', ['text!views/generic-form-revisions-rev-item.html'], function (revItemTemplate) {

    return Backbone.View.extend({

        events: {
            'click li a.restore': 'restore',
        },

        initialize: function (options) {
            var instance = this;

            instance.model = options.model;
            instance.config = options.config;
            instance.revisionsModel = options.revisionsModel;
            instance.setElement($('[data-revisions-list]').get(0));

            instance.model.on('change', function(model) {
                instance.notifyRevisionChanges(model);
            });
        },

        render: function () {
            var instance = this;

            var lastLabel = '';
            instance.$el.html(_(instance.revisionsModel).map(function (rev, i) {
                var label = '<li class="time-label"><span class="bg-green">' + humaneDate(rev.created).toLowerCase() + '</span></li>';
                if (label === lastLabel) {
                    label = ''; 
                } else {
                    lastLabel = label;
                }
                return label + _.template(revItemTemplate, { rev: rev, i: i });
            }).join(''));

            instance.$el.append('<li><i class="fa fa-clock-o"></i><div class="timeline-item"><h3 class="timeline-header no-border">Created</h3></div></li>');

            instance.$el.slimscroll({
                height: ($(window).height() / 1.5) + "px",
                color: "rgba(0,0,0,0.2)"
            });

            instance.currentRevision = instance.revisionsModel[0];
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

            $icons = instance.$('li > i.fa.fa-pencil');
            $icons.each(function (j, el) {
                if (j === selectedIndex) { $(el).attr('class', 'fa fa-pencil bg-aqua'); }
                else { $(el).attr('class', 'fa fa-pencil'); }
            });
        },

        restore: function (event) {
            var instance = this,
                $button = $(event.currentTarget),
                i = $button.data('revision-i'),
                revisionModel = instance.revisionsModel[i];

            instance.previousRevision = instance.currentRevision;
            instance.currentRevision = revisionModel;

            event.preventDefault();
            instance.model.set(revisionModel.modelSnapshot);
            instance.repaintList(i);
            alertify.log('switched content to revision:' + $button.text());
        },

        pushRevision: function (revisionModel) {
            var instance = this;
            instance.previousRevision = instance.currentRevision;
            instance.currentRevision = revisionModel;
        },

        notifyRevisionChanges: function (changingModel) {
            var instance = this,
                report = '',
                diffs = [];
            _(instance.config.schema).each(function (schema, prop) {
                if (!changingModel.hasChanged(prop)) {
                    return;
                }
                var fieldName = schema.title || prop,
                    fieldType = schema.type,
                    valFrom = changingModel.previous(prop),
                    valTo = changingModel.get(prop);

                if ('List' === fieldType) {
                    valFrom = valFrom.length + ' elements';
                    valTo = valTo.length + ' elements';
                }

                if ('Datepicker' === fieldType) {
                    valFrom = (new Date(valFrom)).toLocaleDateString();
                    valTo = (new Date(valTo)).toLocaleDateString();
                }

                if ('Date' === fieldType) {
                    valFrom = (new Date(valFrom)).toTimeString();
                    valTo = (new Date(valTo)).toTimeString();
                }

                if ('File' === fieldType || 'Image' === fieldType || 'ObjectId' === fieldType) {
                    valFrom = _.isObject(valFrom) ? (valFrom[schema.autocompleteField] || valFrom.filename || valFrom._id) : valFrom;
                    valTo = _.isObject(valTo) ? (valTo[schema.autocompleteField] || valTo.filename || valTo._id) : valTo;
                }

                if (valFrom !== valTo) {
                    valFrom = $('<div>' + valFrom.toString() + '</div>').text();
                    valTo = $('<div>' + valTo.toString() + '</div>').text();
                    if (valFrom.length > 500) {
                        valFrom = valFrom.substr(0, 500) + '...';
                    }
                    if (valTo.length > 500) {
                        valTo = valTo.substr(0, 500) + '...';
                    }
                    diffs.push('<h4>' + fieldName + '</h4><p><span class="bg-danger">' + valFrom + '</span> <i class="glyphicon glyphicon-arrow-right"></i> <span class="bg-success">' + valTo + '</span></p>');
                }
            });
            report = '<div class="modal-header"><h3>Changelog</h3>'
            if (instance.previousRevision && instance.currentRevision) {
                report += '<span class="bg-danger"><strong>' + instance.previousRevision.user + '</strong> (' + humaneDate(instance.previousRevision.created).toLowerCase() + ')</span>'
                report += ' <i class="glyphicon glyphicon-arrow-right"></i> '
                report += '<span class="bg-success"><strong>' + instance.currentRevision.user + '</strong> (' + humaneDate(instance.currentRevision.created).toLowerCase() + ')</span>';
            }
            report += '</div>';
            report += '<div class="modal-body">';
            report += diffs.length ? diffs.join('') : '<div class="alert alert-warning">Woha! No changes found.</div>';
            report += '</div>';
            alertify.alert(report);
        }

    });

});
