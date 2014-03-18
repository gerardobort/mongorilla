/*
 * generic model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    _ = require('underscore');


exports.getModel = function () {
    var model = mongoose.models['fs.files'];

    if (model) {

        return model;

    } else {

        var ModelSchema = new Schema({ metadata: Object }, {
            toJSON: {
                transform: function (doc, ret) { 
                    delete ret.length; // this causes problems on backbone forms
                    return ret;
                }
            }
        });
        return mongoose.model('fs.files', ModelSchema, 'fs.files');

    }
};
