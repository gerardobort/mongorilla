'use strict';

/*
 * Helper for hack content pagination
 */

var DEFAULT_IPP = 25; //Items per page

exports.Pager = function (currentUrl, MongooseModel) {
    var _this = {},
        _ = require('underscore'),
        ObjectID = require('mongodb').ObjectID,
        url = require('url'),
        url_parts = url.parse(currentUrl, true);

    _this.currentUrl = currentUrl;
    _this.p = parseInt(url_parts.query.p, 10) || 1;
    _this.ipp = parseInt(url_parts.query.ipp, 10) || DEFAULT_IPP;
    _this.debug = !!url_parts.query.debug;

    function parseQuerystringArray(key) {
        function parseQuerystringArrayLabeled(key, label) {
            var dimension = label ? '[' + label + ']' : '[]';
            // parses either: 
            //   ?param[]=ke1=val1&param[]=key2=val2
            //   ?param=val
            if ('object' === typeof url_parts.query[key + dimension]) {
                return _.reduce(
                    _(url_parts.query[key + dimension]).map(function (filter) {
                        var map = url.parse('?' + filter || '', true).query;
                        _(map).each(function (v, k) {
                            map[k] = (v === parseFloat(v, 10)) ? parseFloat(v, 10) : v;
                        });
                        return map;
                    }),
                    function (memo, prop) {
                        return _.extend(memo, prop);
                    },
                    {}
                );
            } else if ('string' === typeof url_parts.query[key + dimension]) {
                var map = url.parse('?' + url_parts.query[key + dimension] || '', true).query;
                _(map).each(function (v, k) {
                    map[k] = (v === parseFloat(v, 10)) ? parseFloat(v, 10) : v;
                });
                return map;
            }
            return {};
        }

        if ('filters' === key) {  // special feature for labeled OR hashmaps
            var labelsReplaceRegexp = new RegExp('^' + key + '\\[([^\\]]+?)\\]', 'i');
            var filters = {};
            var labels = [];
            _(url_parts.query).each(function (object, k) {
                var label = k.replace(labelsReplaceRegexp, '$1')
                if (label !== k) {
                    labels.push(label);
                }
            });
            labels = _(labels).uniq();


            if (url_parts.query[key + '[]']) {
                filters = parseQuerystringArrayLabeled(key, null);
            }
            if (labels.length) {
                filters.$or = _(labels).map(function (label) { return parseQuerystringArrayLabeled(key, label); });
            }
            return filters;
        } else if (url_parts.query[key + '[]']) {
            return parseQuerystringArrayLabeled(key, null);
        }
    }

    _this.sort = {};
    _(parseQuerystringArray('sort')).each(function (v, k) {
        _this.sort[k] = parseInt(v, 10);
    });
    
    _this.mongoSort = _.extend({}, _this.sort);
    _this.filters = parseQuerystringArray('filters');

    _this.mongoFilters = _this.filters;

    function translatePropertiesToTypes (mongoNamespace) {
        _(mongoNamespace).each(function (value, path) {

            var pathSchema = MongooseModel.schema.paths[path],
                pathSchemaType = 'String';

            if (!pathSchema) {
                console.log('Pager helper warning: Unable to find a path schema for the filter specified.');
            }

            if (pathSchema && pathSchema.instance) {
                pathSchemaType = pathSchema.instance;
            } else if (pathSchema && pathSchema.caster && pathSchema.caster.instance) {
                pathSchemaType = pathSchema.caster.instance;
            } else if (pathSchema && pathSchema.options && pathSchema.options.type) {
                if (Boolean === pathSchema.options.type) {
                    pathSchemaType = 'Boolean';
                } else if (Number === pathSchema.options.type) {
                    pathSchemaType = 'Number';
                } else if (Date === pathSchema.options.type) {
                    pathSchemaType = 'Date';
                }
            }

            if ('String' === pathSchemaType) {
                if (0 === value.indexOf('/')) {
                    var args = value.match(/^\/(.*)\/([igm]*)$/);
                    mongoNamespace[path] = RegExp.bind.apply(RegExp, args)();
                } else if (0 === value.indexOf('$in[')) {
                    mongoNamespace[path] = { $in: _(value.slice(4, value.length-1).split(',')).map(function (value) { return value; }) };
                } else if (0 === value.indexOf('$nin[')) {
                    mongoNamespace[path] = { $nin: _(value.slice(5, value.length-1).split(',')).map(function (value) { return value; }) };
                }
            } else if ('Number' === pathSchemaType) {
                if (0 === value.indexOf('$ne[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $ne: parseFloat(value, 10) };
                } else if (0 === value.indexOf('$lt[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $lt: parseFloat(value, 10) };
                } else if (0 === value.indexOf('$gt[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $gt: parseFloat(value, 10) };
                } else if (0 === value.indexOf('$lte[')) {
                    value = value.slice(5, value.length-1);
                    mongoNamespace[path] = { $lt: parseFloat(value, 10) };
                } else if (0 === value.indexOf('$gte[')) {
                    value = value.slice(5, value.length-1);
                    mongoNamespace[path] = { $gt: parseFloat(value, 10) };
                } else {
                    mongoNamespace[path] = parseFloat(value, 10);
                }
            } else if ('Date' === pathSchemaType) {
                if (0 === value.indexOf('$ne[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $ne: new Date(value) };
                } else if (0 === value.indexOf('$lt[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $lt: new Date(value) };
                } else if (0 === value.indexOf('$gt[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $gt: new Date(value) };
                } else if (0 === value.indexOf('$lte[')) {
                    value = value.slice(5, value.length-1);
                    mongoNamespace[path] = { $lte: new Date(value) };
                } else if (0 === value.indexOf('$gte[')) {
                    value = value.slice(5, value.length-1);
                    mongoNamespace[path] = { $gte: new Date(value) };
                } else {
                    mongoNamespace[path] = new Date(value);
                }
            } else if ('Boolean' === pathSchemaType) {
                if (0 === value.indexOf('$ne[')) {
                    value = 'true' === value.slice(4, value.length-1);
                    mongoNamespace[path] = { $ne: value };
                } else {
                    mongoNamespace[path] = 'true' === value;
                }
            } else if ('ObjectID' === pathSchemaType) {
                if (0 === value.indexOf('$in[')) {
                    mongoNamespace[path] = { $in: _(value.slice(4, value.length-1).split(',')).map(function (id) { return new ObjectID(id); }) };
                } else if (0 === value.indexOf('$nin[')) {
                    mongoNamespace[path] = { $nin: _(value.slice(5, value.length-1).split(',')).map(function (id) { return new ObjectID(id); }) };
                } else if (0 === value.indexOf('$ne[')) {
                    value = value.slice(4, value.length-1);
                    mongoNamespace[path] = { $ne: ('null' === value ? null : new ObjectID(value)) };
                } else {
                    mongoNamespace[path] = new ObjectID(value);
                }
            }
        });
    }


    if (_this.filters.$or) {
        _(_this.filters.$or).each(function (namespace, label) {
            translatePropertiesToTypes(_this.mongoFilters.$or[label]);
        });
    }
    translatePropertiesToTypes(_this.mongoFilters);

    // used internally for querying against mongo
    _this.mongoSkip = (_this.p - 1) * _this.ipp;
    _this.mongoLimit = _this.ipp;

    this.getPage = function () { return _this.p; };
    this.getItemsPerPage = function () { return _this.ipp; };
    this.getMongoSkip = function () { return _this.mongoSkip; };
    this.getMongoLimit = function () { return _this.mongoLimit; };
    this.getMongoSort = function () { return _this.mongoSort; };
    this.getMongoFilter = function () { return _this.mongoFilters; };

    this.setPageCount = function (count) {
        _this.pageCount = count;
    };
    this.getPageCount = function () { return _this.pageCount; };

    this.setTotalCount = function (count) {
        _this.totalCount = count;
    };
    this.getTotalCount = function () { return _this.totalCount; };

    this.setFilters = function (filters) {
        _this.filters = filters;
    };
    this.getFilters = function () { return _this.filters; };

    this.setOffset = function (offset) {
        _this.offset = offset;
    };
    this.getFilters = function () { return _this.filters; };

    this.setCurrentUrl = function (currentUrl) {
        _this.currentUrl = currentUrl;
    };
    this.getCurrentUrl = function () { return _this.currentUrl; };


    this.getPrevUrl = function () {
        if (_this.p > 1) {
            if (_this.currentUrl.match(/((\?|&)p=\d+)/)) {
                return _this.currentUrl.replace(/((\?|&)p=\d+)/, '$2p=' + (_this.p-1));
            }
            return _this.currentUrl + (_this.currentUrl.match(/\?/) ? '&p=' : '?p=') + (_this.p - 1);
        }
        return null;
    };
    this.getNextUrl = function () {
        if (_this.pageCount === _this.ipp && _this.totalCount > _this.ipp * _this.p) {
            if (_this.currentUrl.match(/((\?|&)p=\d+)/)) {
                return _this.currentUrl.replace(/((\?|&)p=\d+)/, '$2p=' + (_this.p+1));
            }
            return _this.currentUrl + (_this.currentUrl.match(/\?/) ? '&p=' : '?p=') + (_this.p + 1);
        }
        return null;
    };

    this.toJSON = function () {
        return {
            p: _this.p,
            total_pages: Math.ceil((_this.totalCount - _this.offset)/(_this.ipp||1)),
            ipp: _this.ipp,
            page_count: _this.pageCount,
            total_count: _this.totalCount,
            filters: _this.debug ? _this.filters : 'Debug mode is not enabled.',
            sort: _this.sort,
            prev: this.getPrevUrl(),
            current: this.getCurrentUrl(),
            next: this.getNextUrl(),
        };
    };
};

/**
 *  Handles getList routes retrieving Mongoose Models (passed by .toJSON())
 *  This works at MongoDB nativre driver Cursor level, getting also the total count for better pagination experience
 */
exports.GetListRouter = function (req, res, MongooseModel, options) {
    var _ = require('underscore'),
        mongoose = require('mongoose'),
        pager = new exports.Pager(req.url, MongooseModel),
        url = require('url'),
        url_parts = url.parse(req.url, true),
        populate = url_parts.query['populate'];

    options = _.extend({ sort: null, fields: {}, filter: pager.getMongoFilter(), filterPatch: {}, offset: 0 }, options);

    if (populate) {
        if (options.populate) {
            if (_.isArray(options.populate)) {
                options.populate = options.populate.concat(populate);
            } else if (_.isString(options.populate)) {
                options.populate += populate;
            }
        } else {
            options.populate = populate;
        }
    }

    options.filter = _.extend(options.filter, options.filterPatch); // allows to override filter options
    this.send = function () {
        MongooseModel.collection
            .find(options.filter, options.fields, {
                skip: pager.getMongoSkip() + options.offset,
                limit: pager.getMongoLimit(),
                sort: pager.getMongoSort(),
            },
            function (err, cursor) {
                cursor.count(false, function (err, total) {
                    var populatePromises = [];
                    if (_.isArray(options.populate)) {
                        options.populate = options.populate.join(' ');
                    }
                    cursor.toArray(function (err, data) {
                        if ('string' === typeof options.populate) {
                            _(data).each(function (modelData) {
                                var MongoosePopulateModel = mongoose.models[modelData.type] || MongooseModel;
                                var populatePromise = new mongoose.Promise();
                                MongoosePopulateModel.findOne({ _id: modelData._id }).populate(options.populate).exec(function (err, model) {
                                    populatePromise.resolve(err, model ? (model.toRestJSON ? model.toRestJSON(req) : model.toJSON()) : null);
                                });
                                populatePromises.push(populatePromise);
                            });
                            mongoose.Promise
                                .when.apply(null, populatePromises)
                                .addBack(function () {
                                    var data = _.toArray(arguments).slice(1);
                                    pager.setPageCount(data.length);
                                    pager.setTotalCount(total);
                                    pager.setOffset(options.offset);
                                    res.send({
                                        pager: pager.toJSON(),
                                        data: _.isArray(data[0]) ? [] : data
                                    });
                                });
                        } else if (data) {
                            data = data.map(function (modelData) {
                                if (modelData.toRestJSON) {
                                    return new MongooseModel(modelData).toRestJSON(req);
                                } else {
                                    return new MongooseModel(modelData).toJSON();
                                }
                            });
                            pager.setPageCount(data.length);
                            pager.setTotalCount(total);
                            res.send({
                                pager: pager.toJSON(),
                                data: data
                            });
                        } else {
                            res.status(500);
                            res.send({ error: err.name });
                        }
                    });
                });
            });
    };
};


exports.GetDistinctListRouter = function (req, res, MongooseModel, options) {
    var _ = require('underscore'),
        pager = new exports.Pager(req.url, MongooseModel);

    options = _.extend({ sort: null, populate: null, fields: {}, filter: pager.getMongoFilter(), filterPatch: {}, offset: 0, distinct: 'unknown_field'}, options);

    options.filter = _.extend(options.filter, options.filterPatch); // allows to override filter options
    this.send = function () {
        MongooseModel.collection
            .distinct(
                options.distinct,
                options.filter,
                function (err, data) {
                    if (data) {
                        pager.setPageCount(1);
                        pager.setTotalCount(data.length);
                        var pagerJSON = pager.toJSON();
                        pagerJSON.p = 1;
                        pagerJSON.ipp = Number.MAX_VALUE;
                        pagerJSON.prev = null;
                        pagerJSON.next = null;
                        res.send({
                            pager: pagerJSON,
                            data: data
                        });
                    } else {
                        res.status(500);
                        res.send({ error: err.name });
                    }
                });
    };
};