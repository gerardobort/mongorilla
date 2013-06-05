Backbone.Form.editors.Base.prototype._initialize = Backbone.Form.editors.Base.prototype.initialize;
Backbone.Form.editors.Base.prototype.initialize = function(options) {
    Backbone.Form.editors.Base.prototype._initialize.call(this, options);
    // this patch adds compatibility between backbone-forms and backbone-relational libraries
    if (options.model instanceof Backbone.RelationalModel && options.model.get(options.key) instanceof Backbone.Collection) {
        this.value = options.model.get(options.key).toJSON();
    }   
};

Backbone.AnimalExtremityModel = Backbone.RelationalModel.extend({

    defaults: {
        part_name: "",
        hair_color: ""
    },

    schema: {
        part_name: { dataType: 'Text', title: 'Part name', validators: ['required'] },
        hair_color: { dataType: 'Text', type: 'Select', title: 'Hair color',
            options: [
                { val: 'black', label: 'Black' },
                { val: 'white', label: 'White' },
                { val: 'brown', label: 'Brown' },
                { val: 'yellow', label: 'Yellow' },
                { val: 'blue', label: 'Blue' }
        ]},
    }

});

Backbone.AnimalHeadModel = Backbone.AnimalExtremityModel.extend();
Backbone.AnimalLegModel = Backbone.AnimalExtremityModel.extend();

Backbone.AnimalModel = Backbone.RelationalModel.extend({

    defaults: {
        name: "",
        type: ""
    },

    relations: [{
            type: Backbone.HasOne,
            key: 'head',
            relatedModel: Backbone.AnimalHeadModel,
            reverseRelation: {
                key: 'body',
                includeInJSON: false
            }
        },
        {
            type: Backbone.HasMany,
            key: 'legs',
            relatedModel: Backbone.AnimalLegModel,
            collectionType: Backbone.Collection,
            reverseRelation: {
                key: 'body',
                includeInJSON: false
            }
    }],

    schema: {
        name: { title: 'Name' },
        type: { dataType: 'Text', type: 'Select', title: 'Animal type',
            options: [
                { val: 'dog', label: 'Dog' },
                { val: 'cat', label: 'Cat' },
        ]},
        head: {
            type: 'NestedModel', model: Backbone.AnimalHeadModel, title: 'Head info'
        },
        legs: {
            type: 'List', itemType: 'NestedModel', model: Backbone.AnimalLegModel, title: 'Legs info',
            itemToString: function(leg) {
                return leg.part_name + ' ('+ leg.hair_color + ')';
            },
        },
    },

});

// This mutes a warning caused by the HasOne relation and BBF.  Btw, the integrations works fine.
// Backbone.Relational.showWarnings = false;

var myPet = new Backbone.AnimalModel();
var form = new Backbone.Form({
    model: myPet
});
$('#test-container').append(form.render().el);
$('#test-container').append('<button id="submit-bbf">Submit</button>');
$('#test-container #submit-bbf').on('click', function () {
    var err;
    if (!(err = form.commit())) {
        console.log('model submitted', form.model);
        console.log('model\'s head hair color ==', form.model.get('head').get('hair_color'));
        console.log('model\'s legs count ==', form.model.get('legs').length);
        alert('validation passed, look at the console for details.');
    } else {
        console.log('model err', err);
        alert('validation failed, look at the console for details.');
    }
});
