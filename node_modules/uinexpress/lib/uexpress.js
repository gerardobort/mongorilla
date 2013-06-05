// uexpress.js
// use underscore as a rendering engine for express 2 and 3

// imports
// http://documentcloud.github.com/underscore
var _ = require('underscore')
// http://nodejs.org/docs/latest/api/fs.html
var fs = require('fs')
// http://nodejs.org/api/path.html
var path = require('path')

//exports
module.exports = {
	compile: compile,
	__express: __express,
}

// variables
// express 3 template cache
var cache = {}

// express 2 method
// str: string html template
function compile(str, options) {
	// template returns function object
	// template.source is the function's JavaScript source string
	var template = _.template(str)
	return function (locals) {
		return template(locals)
	}	
}

// the engine object express 3 requires
// filename is string
// options.layout if present and false: do not use layout
// cb(err, templateFunc)
// for layout case, we need to return a function first rendering file then rendering layout using that result
// for no layout, return a template function based on the file
function __express(filename, options, callback) {

	// get the page template
	getTemplate(filename, function (template) {
		// render page
		var body = template(options)
		// if set to false value other than undefined: skip layout
		// (if missing, set to undefined, evaluating to true: we do layout)
		if (options.layout !== undefined && !options.layout) callback(null, body)
		else {
			// get layout filename
			var layoutFile = options.layout || 'layout'
			if (!path.extname(layoutFile)) layoutFile += '.' + options.settings['view engine']
			if (path.dirname(layoutFile) == '.') layoutFile = path.join(options.settings.views, layoutFile)
			getTemplate(layoutFile, function (layout) {
				// options is a temporary variable in express' app.render
				// we can add fields to it...
				options.body = body
				callback(null, layout(options))
			})
		}
	})

	function getTemplate(filename, cb) {
		// check the cache first
		var template = cache[filename]
		if (template) {
			cb(template)
		} else {

			// read from file and save in cache
			fs.readFile(filename, 'utf-8', function (err, str) {
				if (err) callback(err)
				else {
					// compile to a template
					template = _.template(str)
					if (options.cache) cache[filename] = template
					cb(template)
				}
			})
		}
	}

}