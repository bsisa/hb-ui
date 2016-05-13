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
            	src : [         'src/geoxmlModule.js',

            	                'src/hbMapServiceModule.js',

                                'src/hb5Module.js',
                                'src/hb5Constants.js',
                                'src/hb5Filters.js',
                                'src/menu.js',
								'src/hbActeurCardDirective.js',
								'src/hbActeurCardController.js',
								'src/hbActorListController.js',
								'src/hbActorListDirective.js',
								'src/hbActorLineConverterController.js',
								'src/hbActorLineConverterDirective.js',
								'src/hbAlertMessagesService.js',
								
								'src/hbAmenagementSportifCardDirective.js', 
								'src/hbAmenagementSportifCardController.js',
								'src/hbAmenagementSportifListController.js',
								'src/hbAmenagementSportifListDirective.js',								

								'src/hbAnnexesLinkController.js',
								'src/hbAnnexesLinkDirective.js',
								'src/hbAnnexesComponentController.js',
								'src/hbAnnexesComponentDirective.js',
								'src/hbAnnexesNumberController.js',
								'src/hbAnnexesNumberDirective.js',
								'src/hbAnnexesUploadController.js',
								'src/hbAnnexesUploadDirective.js',

								'src/hbChooseBuildingController.js',
								'src/hbChooseBuildingDirective.js',

								'src/hbBuildingSelectLinkDirective.js',

								'src/hbBuildingLineConverterController.js',
								'src/hbBuildingLineConverterDirective.js',

								'src/hbCardContainerDirective.js',
								'src/hbCardContainerController.js',
								'src/hbCardHeaderDirective.js',
								'src/hbCardViewLinkDirective.js',
								'src/hbChooseActorController.js',
								'src/hbChooseActorDirective.js',
								
								'src/hbChooseCodeController.js',
								'src/hbChooseCodeDirective.js',
								
								'src/hbChooseOneController.js',
								'src/hbChooseOneDirective.js',
								
								'src/hbChooseSurfaceController.js',
								'src/hbChooseSurfaceDirective.js',
								
								'src/hbCiterneCardController.js',
								'src/hbCiterneCardDirective.js',
								
								'src/hbCodeCardController.js',
								'src/hbCodeCardDirective.js',
								'src/hbCodeListController.js',
								'src/hbCodeListDirective.js',
								
								'src/hbCollapseController.js',
								'src/hbCollapseDirective.js',

								'src/hbCommandeCardController.js',
								'src/hbCommandeCardDirective.js',

								'src/hbCommandeListController.js',
								'src/hbCommandeListDirective.js',
								
								'src/hbConstatCardDirective.js',
								'src/hbConstatCardController.js',
								'src/hbConstatListController.js',
								'src/hbConstatListDirective.js',
								'src/hbContratCardController.js',
								'src/hbContratCardDirective.js',
                                'src/hbDashboardDirective.js',
                                'src/hbDashboardController.js',
                                
                                'src/hbDashboardDomDirective.js',
                                'src/hbDashboardDomController.js',                                
                                
                                'src/hbDashboardSdsDirective.js',
                                'src/hbDashboardSdsController.js',

								'src/hbDateDirective.js',
								'src/hbDateController.js',
								'src/hbDateParserDirective.js',
								'src/hbDefaultCardDirective.js',
								'src/hbDefaultCardController.js',
								'src/hbDropdownMenuDirective.js',
								
								'src/hbDynamicNameDirective.js',
								'src/hbEnterDirective.js',
								'src/hbEqualsDirective.js',
								'src/hbFontaineCardController.js',
								'src/hbFontaineCardDirective.js',
								'src/hbFontaineListController.js',
								'src/hbFontaineListDirective.js',
								'src/hbFormeComponentController.js',
								'src/hbFormeComponentDirective.js',
								
								'src/hbHorlogeCardController.js',
								'src/hbHorlogeCardDirective.js',
								'src/hbHorlogeListController.js',
								'src/hbHorlogeListDirective.js',
								'src/hbImmeubleCardDirective.js', 
								'src/hbImmeubleCardController.js',
								'src/hbImmeubleListController.js',
								'src/hbImmeubleListDirective.js',

								'src/hbInstallationSportiveCardController.js',
								'src/hbInstallationSportiveCardDirective.js',

								'src/hbListContainerController.js',
								'src/hbListContainerDirective.js',
								'src/hbMapController.js',

								'src/hbNoDirtyCheckDirective.js', 
								
								'src/hbOrderSpreadsheetController.js',
								'src/hbOrderSpreadsheetDirective.js',
								
								'src/hbPrestationCardController.js',
								'src/hbPrestationCardDirective.js',
								'src/hbPrestationListController.js',
								'src/hbPrestationListDirective.js',
								'src/hbPrintService.js',
								'src/hbProductionChaleurCardController.js',
								'src/hbProductionChaleurCardDirective.js',
								'src/hbProductionFroidCardController.js',
								'src/hbProductionFroidCardDirective.js',
								'src/hbQueryService.js',
								'src/hbRoleCardController.js',
								'src/hbRoleCardDirective.js',
								'src/hbSearchController.js',
								'src/hbSearchDirective.js',

								'src/hbSearchDomController.js',
								'src/hbSearchDomDirective.js',
								
								'src/hbSearchSdsController.js',
								'src/hbSearchSdsDirective.js',

								'src/hbSurfaceCardController.js',
								'src/hbSurfaceCardDirective.js',
								'src/hbSingleSelectController.js',
								'src/hbSingleSelectDirective.js',
								'src/hbTabCacheService.js',
								'src/hbTransactionCardController.js',
								'src/hbTransactionCardDirective.js',
								'src/hbTransactionCreateCardDirective.js',
								
								'src/hbTypeaheadCodeController.js',
								'src/hbTypeaheadCodeDirective.js',
								
								'src/hbUniqueRoleDirective.js',
								'src/hbUniqueUserDirective.js',

								'src/hbUniteLocativeListController.js',
								'src/hbUniteLocativeListDirective.js',								
								'src/hbUtilService.js',
								'src/hbUserCardController.js',
								'src/hbUserCardDirective.js',
								
								'src/hbValidCodeDirective.js',
								
								'src/hbVentilationCardController.js',
								'src/hbVentilationCardDirective.js',
								'src/hbWcListDirective.js',
								'src/hbWcListController.js',
								'src/spreadsheetSelect.js',
								'src/userDetailsService.js'],
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
