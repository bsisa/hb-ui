module.exports = function (grunt) {

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
                src: [
                    'src/hb5Module.js',

                    'src/_commons/geoxmlModule.js',
                    'src/_commons/hb5Constants.js',
                    'src/_commons/hb5Filters.js',
                    'src/_commons/menu.js',
                    'src/_commons/wcAngularOverlay.js',


                    'src/_directives/hbChooseOneController.js',
                    'src/_directives/hbChooseOneDirective.js',
                    'src/_directives/hbCollapseController.js',
                    'src/_directives/hbCollapseDirective.js',
                    'src/_directives/hbDateDirective.js',
                    'src/_directives/hbDateController.js',
                    'src/_directives/hbDateParserDirective.js',
                    'src/_directives/hbDropdownMenuDirective.js',
                    'src/_directives/hbDynamicNameDirective.js',
                    'src/_directives/hbEnterDirective.js',
                    'src/_directives/hbEqualsDirective.js',
                    'src/_directives/hbFormeComponentController.js',
                    'src/_directives/hbFormeComponentDirective.js',
                    'src/_directives/hbListContainerController.js',
                    'src/_directives/hbListContainerDirective.js',
                    'src/_directives/hbNoDirtyCheckDirective.js',
                    'src/_directives/hbSingleSelectController.js',
                    'src/_directives/hbSingleSelectDirective.js',
                    'src/_directives/hbTypeaheadCodeController.js',
                    'src/_directives/hbTypeaheadCodeDirective.js',
                    'src/_directives/hbValidCodeDirective.js',


                    'src/_directives/hbSearchController.js',
                    'src/_directives/hbSearchDirective.js',
                    'src/_directives/hbSearchDomController.js',
                    'src/_directives/hbSearchDomDirective.js',
                    'src/_directives/hbSearchSdsController.js',
                    'src/_directives/hbSearchSdsDirective.js',

                    'src/_services/hbPrintService.js',
                    'src/_services/hbQueryService.js',
                    'src/_services/hbMapServiceModule.js',
                    'src/_services/hbMapController.js',
                    'src/_services/hbTabCacheService.js',
                    'src/_services/hbUtilService.js',
                    'src/_services/userDetailsService.js',


                    'src/acteur/hbActeurCardDirective.js',
                    'src/acteur/hbActeurCardController.js',
                    'src/acteur/hbActorListController.js',
                    'src/acteur/hbActorListDirective.js',
                    'src/acteur/hbActorLineConverterController.js',
                    'src/acteur/hbActorLineConverterDirective.js',
                    'src/acteur/hbAlertMessagesService.js',
                    'src/acteur/hbChooseActorController.js',
                    'src/acteur/hbChooseActorDirective.js',

                    'src/amenagement_sportif/hbAmenagementSportifCardDirective.js',
                    'src/amenagement_sportif/hbAmenagementSportifCardController.js',
                    'src/amenagement_sportif/hbAmenagementSportifListController.js',
                    'src/amenagement_sportif/hbAmenagementSportifListDirective.js',

                    'src/annexes/hbAnnexesLinkController.js',
                    'src/annexes/hbAnnexesLinkDirective.js',
                    'src/annexes/hbAnnexesComponentController.js',
                    'src/annexes/hbAnnexesComponentDirective.js',
                    'src/annexes/hbAnnexesNumberController.js',
                    'src/annexes/hbAnnexesNumberDirective.js',
                    'src/annexes/hbAnnexesUploadController.js',
                    'src/annexes/hbAnnexesUploadDirective.js',

                    'src/building/hbChooseBuildingController.js',
                    'src/building/hbChooseBuildingDirective.js',
                    'src/building/hbBuildingSelectLinkDirective.js',
                    'src/building/hbBuildingLineConverterController.js',
                    'src/building/hbBuildingLineConverterDirective.js',

                    'src/card/hbCardContainerDirective.js',
                    'src/card/hbCardContainerController.js',
                    'src/card/hbCardHeaderDirective.js',
                    'src/card/hbCardViewLinkDirective.js',
                    'src/card/hbDefaultCardDirective.js',
                    'src/card/hbDefaultCardController.js',

                    'src/citerne/hbCiterneCardController.js',
                    'src/citerne/hbCiterneCardDirective.js',

                    'src/code/hbChooseCodeController.js',
                    'src/code/hbChooseCodeDirective.js',
                    'src/code/hbCodeCardController.js',
                    'src/code/hbCodeCardDirective.js',
                    'src/code/hbCodeListController.js',
                    'src/code/hbCodeListDirective.js',

                    'src/commande/hbCommandeCardController.js',
                    'src/commande/hbCommandeCardDirective.js',
                    'src/commande/hbCommandeListController.js',
                    'src/commande/hbCommandeListDirective.js',
                    'src/commande/hbOrderSpreadsheetController.js',
                    'src/commande/hbOrderSpreadsheetDirective.js',


                    'src/constat/hbConstatCardDirective.js',
                    'src/constat/hbConstatCardController.js',
                    'src/constat/hbConstatListController.js',
                    'src/constat/hbConstatListDirective.js',

                    'src/contrat/hbContratCardController.js',
                    'src/contrat/hbContratCardDirective.js',
                    'src/contrat/hbContratListController.js',
                    'src/contrat/hbContratListDirective.js',

                    'src/dashboard/hbDashboardDirective.js',
                    'src/dashboard/hbDashboardController.js',
                    'src/dashboard/hbDashboardDomDirective.js',
                    'src/dashboard/hbDashboardDomController.js',
                    'src/dashboard/hbDashboardSdsDirective.js',
                    'src/dashboard/hbDashboardSdsController.js',

                    'src/fontaine/hbFontaineCardController.js',
                    'src/fontaine/hbFontaineCardDirective.js',
                    'src/fontaine/hbFontaineListController.js',
                    'src/fontaine/hbFontaineListDirective.js',


                    'src/horloge/hbHorlogeCardController.js',
                    'src/horloge/hbHorlogeCardDirective.js',
                    'src/horloge/hbHorlogeListController.js',
                    'src/horloge/hbHorlogeListDirective.js',

                    'src/immeuble/hbImmeubleCardDirective.js',
                    'src/immeuble/hbImmeubleCardController.js',
                    'src/immeuble/hbImmeubleListController.js',
                    'src/immeuble/hbImmeubleListDirective.js',

                    'src/installation_sportive/hbInstallationSportiveCardController.js',
                    'src/installation_sportive/hbInstallationSportiveCardDirective.js',

                    'src/prestation/hbPrestationCardController.js',
                    'src/prestation/hbPrestationCardDirective.js',
                    'src/prestation/hbPrestationListController.js',
                    'src/prestation/hbPrestationListDirective.js',

                    'src/production_chaud_froid/hbProductionChaleurCardController.js',
                    'src/production_chaud_froid/hbProductionChaleurCardDirective.js',
                    'src/production_chaud_froid/hbProductionFroidCardController.js',
                    'src/production_chaud_froid/hbProductionFroidCardDirective.js',


                    'src/user_role/hbRoleCardController.js',
                    'src/user_role/hbRoleCardDirective.js',
                    'src/user_role/hbUniqueRoleDirective.js',
                    'src/user_role/hbUniqueUserDirective.js',
                    'src/user_role/hbUserCardController.js',
                    'src/user_role/hbUserCardDirective.js',


                    'src/surface/hbSurfaceCardController.js',
                    'src/surface/hbSurfaceCardDirective.js',
                    'src/surface/hbChooseSurfaceController.js',
                    'src/surface/hbChooseSurfaceDirective.js',
                    'src/surface/hbUniteLocativeListController.js',
                    'src/surface/hbUniteLocativeListDirective.js',

                    'src/transaction/hbTransactionCardController.js',
                    'src/transaction/hbTransactionCardDirective.js',
                    'src/transaction/hbTransactionCreateCardDirective.js',

                    'src/ventilation/hbVentilationCardController.js',
                    'src/ventilation/hbVentilationCardDirective.js',

                    'src/wc/hbWcListDirective.js',
                    'src/wc/hbWcListController.js'

                ],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> Copyright 2013,2014 BSI SA. Licensed under the Apache License, Version 2.0 */\n'
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
        },
        pug: {
            compile: {
                options: {
                    data: {
                        debug: false
                    }
                },
                files: [
                    {
                        cwd: "templates",
                        src: "**/*.pug",
                        dest: "views-compiled",
                        expand: true,
                        ext: ".html"
                    }
                ]
            }
        },

        watch: {
            files: ["templates/**/*.pug"],
            tasks: ["pug"]
        }
    });

    // Load the plugin that provides the "concat" and "uglify" tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks("grunt-contrib-pug");
    grunt.loadNpmTasks('grunt-html2js');

    // Default task(s).
    grunt.registerTask('default', ['concat:dist', "pug", 'uglify', 'cssmin']);
    grunt.registerTask('watch', ['watch']);

};
