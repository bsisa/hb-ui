module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


        karma: {
            unit: {
                configFile: 'test/karma-unit.js',
                // run karma in the background
                background: true,
                // which browsers to run the tests on
                browsers: ['Chrome', 'Firefox']
            }
        },

        concat: {
            options: {
                separator: ''
            },
            dist: {
            	src : [         'src/geoxml.js',
                                'src/hbMapService.js',
                                'src/hb5.js',
                                'src/menu.js',
								'src/hbActeurCardDirective.js',
								'src/hbActeurCardController.js',
								'src/hbAlertMessagesService.js',
								'src/hbCardContainerDirective.js',
								'src/hbCardContainerController.js',
								'src/hbCardHeaderDirective.js',
								'src/hbChooseOneController.js',
								'src/hbChooseOneDirective.js',
								'src/hbConstatCardDirective.js',
								'src/hbConstatCardController.js',
								'src/hbDateDirective.js',
								'src/hbDateController.js',
								'src/hbDateParserDirective.js',
								'src/hbDefaultCardDirective.js',
								'src/hbDefaultCardController.js',
								'src/hbDropdownMenuDirective.js',
								'src/hbImmeubleCardDirective.js', 
								'src/hbImmeubleCardController.js',								
								'src/hbListContainerController.js',
								'src/hbListContainerDirective.js',
								'src/hbMapController.js',
								'src/hbUtilService.js',
								'src/spreadsheetSelect.js'],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> Copyright 2013,2014 Guy de Pourtalès. Licensed under the Apache License, Version 2.0 */\n'
            },

            build: {
                src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },

        cssmin: {
            combine: {
                files: {
                    'dist/<%= pkg.name %>-<%= pkg.version %>.css': ['css/hb5.css']
                }
            },

            minify: {
                expand: true,
                cwd: 'dist/',
                src: ['<%= pkg.name %>-<%= pkg.version %>.css'],
                dest: 'dist/',
                ext: '.min.css'
            }
        }

    });

    // Load the plugin that provides the "concat" and "uglify" tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-karma');

    // Default task(s).
    grunt.registerTask('default', ['concat:dist', 'uglify', 'cssmin' ]);

};