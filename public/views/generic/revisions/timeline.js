define('views/generic/revisions/timeline', ['text!views/generic/revisions/timeline-item.html'], function (revItemTemplate) {

    return Backbone.View.extend({

        events: {
            'click li a.restore': 'restore',
            'click li a.remove-revision': 'remove',
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

            var currentRevisionIndex = 0; 
            _(instance.revisionsModel).every(function (rev, i) {
                if (!rev.is_draft) {
                    currentRevisionIndex = i;
                    return false;
                }
                return true;
            });
            instance.currentRevision = instance.revisionsModel[currentRevisionIndex];
            instance.repaintList(currentRevisionIndex);
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

            $icons = instance.$('li > a.fa');
            $icons.each(function (j, el) {
                if (j === selectedIndex) { $(el).toggleClass('bg-aqua', true); }
                else { $(el).toggleClass('bg-aqua', false); }
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
            alertify.log('switched content to revision: "<i>' + revisionModel.description + '</i>"<br/> by <strong>' + revisionModel.user + '</strong>');
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

                if (valFrom !== valTo && !(!valFrom && !valTo)) {
                    console.log(fieldName, '<',valFrom, '><' ,valTo,'>')
                    valFrom = valFrom ? $('<div>' + valFrom.toString() + '</div>').text() : '';
                    valTo = valTo ? $('<div>' + valTo.toString() + '</div>').text() : '';
                    if (valFrom.length > 500) {
                        valFrom = valFrom.substr(0, 500) + '...';
                    }
                    if (valTo.length > 500) {
                        valTo = valTo.substr(0, 500) + '...';
                    }
                    diffs.push('<td>' + fieldName + '</td><td class="bg-danger">' + valFrom + '</td><td class="bg-success">' + valTo + '</td>');
                }
            });
            report = '<div class="alert alert-success alert-dismissable diff-report">';
            report += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
            if (diffs.length) {
            report += '<h4>Changelog</h4>';
            report += '<table class="table table-stripped"><tr><th></th><th>From</th><th>To</th></tr>';
                if (instance.previousRevision && instance.currentRevision) {
                    report += '<tr><th>Revision</th><td class="bg-danger"><strong>' + instance.previousRevision.user + '</strong> (' + humaneDate(instance.previousRevision.created).toLowerCase() + ')<p>"' + instance.previousRevision.description + '"</p></td>'
                    report += '<td class="bg-success"><strong>' + instance.currentRevision.user + '</strong> (' + humaneDate(instance.currentRevision.created).toLowerCase() + ')<p>"' + instance.currentRevision.description + '"</p></td></tr>';
                }
            report += '<tr>' + diffs.join('</tr><tr>') + '</tr>';
            } else {
            report += '<strong>Woha!</strong> No changes found.';
            }
            report += '</table>';
            report += '</div>';
            //alertify.alert(report);
            var $report = $(report);
            $('.diff-report').fadeOut(0, function () { $(this).remove(); });
            $('#collection-form').before($report);
            $report.hide().fadeIn(600);
        },

        remove: function (event) {
            var instance = this,
                $button = $(event.currentTarget),
                i = $button.data('revision-i'),
                revisionModel = instance.revisionsModel[i];

            event.preventDefault();
            alertify.confirm('Are you sure you want to remove this revision?', function (ok) {
                if (!ok) {
                    return;
                }
                require(['models/' + revisionModel.collectionName + '-revision', ], function (RevisionModel) {
                    var revision = new RevisionModel(revisionModel);
                    revision.destroy({
                        success: function() {
                            alertify.log('revision removed: "<i>' + revisionModel.description + '</i>"<br/> by <strong>' + revisionModel.user + '</strong>');
                            instance.revisionsModel.splice(i, 1);
                            instance.render();
                        }
                    });
                });
            });
        },

    });

});
