var DEFAULT_IPP = 30;

exports.Pager = function (currentUrl) {
    var _this = {},
        _ = require('underscore'),
        ObjectID = require('mongodb').ObjectID,
        url = require('url'),
        url_parts = url.parse(currentUrl, true);

    _this.currentUrl = currentUrl;
    _this.p = parseInt(url_parts.query.p, 10) || 1;
    _this.ipp = parseInt(url_parts.query.ipp, 10) || DEFAULT_IPP;

    if ('object' === typeof url_parts.query['filters[]']) {
        _this.filters = _.reduce(
            _(url_parts.query['filters[]']).map(function (filter) {
                return url.parse('?' + filter || '', true).query; 
            }),
            function (memo, prop) {
                return _.extend(memo, prop); 
            }, 
            {}
        );
    } else if ('string' === typeof url_parts.query['filters[]']) {
        _this.filters = url.parse('?' + url_parts.query['filters[]'] || '', true).query;
    }

    _this.mongoFilters = _.extend({}, _this.filters);
    _(_this.mongoFilters).each(function (value, path) {
        // regexps useful for autocompletion: example: &filters[]=brand_id=/^lawR/i
        if ('string' === typeof value && 0 === value.indexOf('/')) {
            var args = value.match(/^\/(.*)\/([igm]*)$/);
            _this.mongoFilters[path] = RegExp.bind.apply(RegExp, args)();
        }
        // _id: { $in: [] } searches: example: &filters[]=_id=$in[53235ba87ece4c5b65321a92,53235ba87ece4c5b65321a8f]
        if ('_id' === path && 'string' === typeof value && 0 === value.indexOf('$in[')) {
            _this.mongoFilters[path] = { $in: _(value.slice(4, value.length-1).split(',')).map(function (id) { return new ObjectID(id); }) };
            _this.filters[path] = { $in: value.slice(4, value.length-1).split(',') };
        } else if ('_id' === path && 'string' === typeof value) {
            _this.mongoFilters[path] = new ObjectID(value);
        } else if ('string' === typeof value && 0 === value.indexOf('$in[')) {
            _this.mongoFilters[path] = { $in: _(value.slice(4, value.length-1).split(',')).map(function (value) { return value; }) };
            _this.filters[path] = { $in: value.slice(4, value.length-1).split(',') };
        }
    });

    // used internally for querying against mongo
    _this.mongoSkip = (_this.p - 1) * _this.ipp;
    _this.mongoLimit = _this.ipp;

    this.getPage = function () { return _this.p; };
    this.getItemsPerPage = function () { return _this.ipp; };
    this.getMongoSkip = function () { return _this.mongoSkip; };
    this.getMongoLimit = function () { return _this.mongoLimit; };
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
            total_pages: Math.round(_this.totalCount/(_this.ipp||1)),
            ipp: _this.ipp,
            page_count: _this.pageCount,
            total_count: _this.totalCount,
            filters: _this.filters,
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
exports.GetListRouter = function (req, res, mongooseModel, options) {
    var _ = require('underscore'),
        mongoose = require('mongoose'),
        pager = new exports.Pager(req.url),
        options = _.extend({ sort: null, populate: null }, options);
    
    this.send = function () {
        mongooseModel.collection
            .find(
                pager.getMongoFilter(true),
                {
                    skip: pager.getMongoSkip(),
                    limit: pager.getMongoLimit(),
                },
                function (err, cursor) {
                    cursor.count(false, function (err, total) {
                        var populatePromises = [];
                        cursor.toArray(function (err, data) {
                            if ('string' === typeof options.populate) {
                                _(data).each(function (modelData) {
                                    var populatePromise = new mongoose.Promise();
                                    mongooseModel.findOne({ _id: modelData._id }).populate(options.populate).exec(function (err, model) {
                                        populatePromise.resolve(err, model.toJSON());
                                    });
                                    populatePromises.push(populatePromise);
                                });
                                mongoose.Promise
                                    .when.apply(null, populatePromises)
                                    .addBack(function (err) {
                                        var data = _.toArray(arguments).slice(1);
                                        pager.setPageCount(data.length);
                                        pager.setTotalCount(total);
                                        res.send({
                                            pager: pager.toJSON(),
                                            data: data
                                        });
                                    });
                            } else if (data) {
                                data = data.map(function (modelData) {
                                    return new mongooseModel(modelData).toJSON();
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
