({
    baseUrl: './',
    optimize: 'uglify',
    //optimize: 'none',
    findNestedDependencies: true,
    //optimizeCss: 'standard',
    preserveLicenseComments: false,
    //skipDirOptimize: true,
    //useStrict: true,
    name: 'init',
    out: 'init-build.js',
    fileExclusionRegExp: /^(api|form|model|collection)/,
    mainConfigFile: 'init.js',
    wrapShim: true
})
