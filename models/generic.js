/*
 * generic model
 */

var _ = require('underscore');
var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

require('./file').getModel();

function addToSchema(schema, key, type) {
    if (key.indexOf('.') !== -1) {
        var keys = key.split('.');
        var obj = schema;
        for (var i = 0; i < keys.length; i++) {
            if (keys.length-1 === i) {
                obj[keys[i]] = type; // last key elem
            } else {
                obj[keys[i]] = obj[keys[i]] || { };
                obj = obj[keys[i]];
            }
        }
    } else {
        schema[key] = type;
    }
    return schema;
}

exports.getModel = function (collectionName) {
    
    var model = mongoose.models[collectionName];

    if (model) {

        return model;

    } else {

        if(!global.config.collections){
            tempconfig = require('../helpers/config').loadConfig();
            global.config.collections = tempconfig.collections;
        }

        var collection = _(global.config.collections).find(function (col) {
            return col.name === collectionName;
        });

        // _id should not be specified in schema ... http://stackoverflow.com/a/10835032
        var schema = collection.mongoose.schema || { };

        /*
            default types
                String
                Number
                Boolean
                DocumentArray
                Array
                Buffer
                Date
                ObjectId
                Mixed
                Oid
                Object
                Bool
            https://github.com/bnoguchi/mongoose-types
                Email
                Url
        */

        _(collection.backboneForms.schema).each(function (def, key) {
            var val = null;
            switch (def.type) {
                default:
                case 'Text':     val = String; break;
                case 'TextArea': val = String; break;
                case 'Select':     val = String; break;
                case 'Number':   val = Number; break;
                case 'Object':   val = Object; break;
                case 'List':     val = Array; break;
                case 'Date':     val = Date; break;
                case 'Datepicker': val = Date; break;
                case 'DateTime': val = Date; break;
                case 'Datetimepicker' : val = Date; break;
                case 'Colorpicker': val = String; break;
                case 'File':     val = Object; break;
                case 'Image':    val = Object; break;
                case 'Checkbox':    val = Boolean; break;
                case 'Checkboxes':    val = [String]; break;
                // TODO review this
            }
            schema = addToSchema(schema, key, val);
        });

        /// add custom relations
        _(collection.relations).each(function (relation, key) {
            var relationSchema = { type: ObjectId, ref: relation.relatedCollection };
            relationSchema = ('HasMany' === relation.type ? [relationSchema] : relationSchema);
            schema = addToSchema(schema, key, relationSchema);
        });


        addToSchema(schema, collection.createdField.key, global[collection.createdField.type||'Date']);
        addToSchema(schema, collection.updatedField.key, global[collection.updatedField.type||'Date']);

        var options = {
            // http://aaronheckmann.tumblr.com/post/48943525537/mongoose-v3-part-1-versioning
            versionKey: '_mongorillaVersion'
        };

        var ModelSchema = new Schema(schema, options);
        if(collection.mongoCollection){
            function BaseSchema() {
                Schema.apply(this, arguments);
            }
            util.inherits(BaseSchema, Schema);

            var ParentSchema = new BaseSchema(null);
            ModelSchema = new BaseSchema(schema);

            try{
                var Parent = mongoose.model(collection.mongoCollection);
            }catch(e){
                var Parent = mongoose.model(collection.mongoCollection, ParentSchema, collection.mongoCollection);
            }
            var Model = Parent.discriminator(collection.name, ModelSchema);
        }

        try {
            var schemaExtension = require('./plugins/' + collectionName);
            ModelSchema.plugin(schemaExtension);
            console.log('Plugin found for this generic model: ' + collectionName);
        } catch (e) {
            console.log('No plugin found for this generic model, no problem: ' + collectionName);
        }

        ModelSchema.methods = {
        };

        if(!collection.mongoCollection){
            mongoose.model(collectionName, ModelSchema, collectionName);
        }

        // this is only for loading purposes: whitout this the refs may not work
        _(collection.relations).each(function (relation, key) {
            if (!mongoose.models[relation.relatedCollection]) {
                var relatedModel = exports.getModel(relation.relatedCollection);
            }
        });


        return mongoose.model(collectionName);
    }
}
