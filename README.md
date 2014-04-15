## Mongorilla is a simple and powerful CMS for MongoDB

[![Build Status](https://travis-ci.org/gerardobort/mongorilla.svg?branch=master)](https://travis-ci.org/gerardobort/mongorilla)

Check the [Live demo!](http://mongorilla.herokuapp.com)


## Why Mongorilla
Mongoorilla let you define your Mongo Documnets schemas by simply editing a [JSON config file](https://github.com/gerardobort/mongorilla/blob/master/config/default.json).
Once you have the JSON setup, It will generate (on the fly) the administrator views and forms, including dashboards and search tools.
The principle of Mongorilla is to store your documents *as you defined* directly in MongoDB.  This means *no extra metadata embed on your documents*.  You define the documents structure as you want!

## Dependencies
Mongorilla is a NodeJS application, distributed via NPM which also have both: NPM and Bower dependencies.  The application is built on top of:
* Express3
* Mongoose
* BackboneJS
* Backbone-Forms in combination with Backbone-Deep-Model
* Bootstrap3

## Key features
* Support for multidimentional documents and/with ObjectId document references.
* Support for File/Image uploads against the same MongoDB using GridFS, and/or Amazon S3 buckets.
* Supports rich content, CKEditor come out of the box.
* Revisioning - You can rollback document revisions very easily, by navigating an edition tmieline!
* Customizing Mongorilla from the source code is not as terrible as in other CMSs.  Even tweaking forms, you can create your own editors, create backend hooks and even, re-use the REST API to serve the content to your frontend app.

##Installation

### Using Git
1. Clone this repository: ``$ git clone https://github.com/gerardobort/mongorilla.git``
2. Install the dependencies: (once in the repository folder) ``$ npm install``
3. Setup your MongoDB connection: ``$ export MONGORILLA_MONGO_URL="mongodb://localhost/my_mongorilla"``
4. Run the server instance: ``$ nodejs server.js``
5. Enjoy!

### Deploy to Heroku
1. Clone this repository: ``$ git clone https://github.com/gerardobort/mongorilla.git`` (or follow the NPM steps)
2. Add your Heroku app remote: ``$ git remote add path-to@your-heroku-app.git``
3. Install one of the MongoDB Addons to your Heroku App (``$ heroku addons:add mongolab`` or ``heroku addons:add mongohq``).
4. Push to Heroku ``git push heroku``.
5. Enjoy!

### Using NPM
1. ``$ npm install mongorilla``
2. Setup your MongoDB connection: ``$ export MONGORILLA_MONGO_URL="mongodb://localhost/my_mongorilla"``
3. Run the server instance: ``$ nodejs node_modules/mongorilla/server.js``
4. Enjoy!

## Roadmap
* Improve documentation
* Make all the configuration (schemas and users) be editable from the same admin panel.

:monkey_face:  :hamburger:
