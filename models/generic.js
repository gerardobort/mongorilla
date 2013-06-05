
/*
 * generic model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var GenericSchema = new Schema({
    _id: ObjectId
});

GenericSchema.methods = {
};

mongoose.model('Generic', GenericSchema, 'generic');
