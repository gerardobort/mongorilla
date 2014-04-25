## TODO list for this branch (config-manager)

### mongorillaCollection

#### BackboneForm
* Add relations editor
* Make validations work on bootstrap-modal (editor type: Object)
* Add field validtor "Callback" or "Custom Validator"
* Add fastSearch editor
* Object Modal - DeepModel and dotnotation - should fix

#### Mongoose Model
* Reload model schema on save (backend) and update global.config if necessary :heavy_check_mark:
* Do the above change in a generic form that allow any user to extend backend models functionality as in the frontend. :heavy_check_mark:
NOTE: check for models/plugins files... mongoose plugins are the way to go for extending backend functionality in Mongorilla :monkey:
