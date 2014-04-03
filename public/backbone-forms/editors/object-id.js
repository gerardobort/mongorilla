(function() {

    /**
     * Backbone Forms ObjectId editor
     * @author gerardobort <gerardobort@gmail.com>
     * @requires bootstrap-typeahead
     */
    Backbone.Form.editors.ObjectId = Backbone.Form.editors.Base.extend({

        tagName: 'div',
        
        defaultValue: '',
        
        initialize: function(options) {
            var editor = this;

            var options = options || {};

            //Set initial value
            if (options.model) {
                if (!options.key) throw "Missing option: 'key'";

                this.model = options.model;

                // string from model
                this.value = this.model.get(options.key);
            } else if (options.value) {
                // object from list
                this.value = options.value;
            }

            editor.$el.addClass('bbf-object-id');
            editor.options = options;
            _.extend(editor, _.pick(options, 'key', 'form'));
            var schema = editor.schema = options.schema || {};
            editor.validators = options.validators || schema.validators;
        },

        /**
         * Adds the editor to the DOM
         */
        render: function() {
            var editor = this;
            editor.$el.removeClass('form-control');
            editor.$el.html(
                '<input type="hidden" name="_id" placeholder="Search..." autocomplete="off">'
                + '<input class="form-control" type="text" name="' + editor.schema.autocompleteField + '" placeholder="Search..." autocomplete="off">'
                + '<span class="info btn-group"></span>'
            );
            if (editor.value) {
                $('input[type="hidden"]', editor.$el).val(editor.value['_id']);
                $('input[type="text"]', editor.$el).val(editor.value[editor.schema.autocompleteField]);
            }
            this._delegateEvents();
            editor.refresh();

            return this;
        },

        _delegateEvents: function () {
            var editor = this;

            $('input[type="text"]', editor.$el).on('focus', function (e) {
                var $field = $(this),
                    fieldName = editor.schema.autocompleteField,
                    dataCache = {};

                if ($field.data('typeahead')) {
                    return;
                }
                $field.on('change', function () {
                    var $this = $(this);
                    setTimeout(function () {
                        var res = dataCache[$this.val()];
                        if (res) {
                            $('[type="hidden"]', editor.$el).val(res._id);
                            editor.setValue(res);
                        }
                    }, 200); // this is to avoid the delay since clicking until the value is set
                });
                $field.typeahead({
                    ajax: {
                        url: '/api/search/' + editor.schema.autocompleteCollectionName,
                        timeout: 300,
                        displayField: 'endpoint',
                        triggerLength: 1,
                        method: 'get',
                        loadingClass: "loading-circle",
                        preDispatch: function (query) {
                            return {
                                q: query
                            }
                        },
                        preProcess: function (data) {
                            var results = _(data.data).map(function (res) {
                                dataCache[res[fieldName]] = res;
                                return {
                                    name: res[fieldName],
                                    _id: res._id
                                };
                            });
                            return results;
                        }
                    }
                });
            });

        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue: function() {
            // set the file object w/ObjectId
            return this.value;
        },
        
        /**
         * Sets the value of the form element
         * @param {String}
         */
        setValue: function(value) { 
            var editor = this;

            // set the file object w/ObjectId
            editor.value = value;
            editor.render();
        },

        refresh: function () {
            var editor = this;

            if (editor.value) {
                $('.info', editor.$el).html(
                    '<a target="_blank" class="btn btn-default btn-small" href="/edit/'
                        + editor.schema.autocompleteCollectionName + '/' + editor.value._id + '">'
                        + '<i class="glyphicon glyphicon-edit"></i></a>'
                    + ' <a target="_blank" class="btn btn-default btn-small" href="/preview/'
                        + editor.schema.autocompleteCollectionName + '/' + editor.value._id + '">'
                        + '<i class="glyphicon glyphicon-eye-open"></i></a>'
                );
            } else {
                $('.info', editor.$el).html(
                    'no ' + editor.schema.autocompleteCollectionName + ' linked'
                );
            }
        },

        focus: function () {
            $('[type="text"]', this.$el).get(0).focus();
        },

        blur: function () {
            $('[type="text"]', this.$el).get(0).blur();
        }
    });

}());
