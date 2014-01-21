(function() {
    angular.module('hb5').controller('MenuController', ['$scope', 'GeoxmlService', function($scope, GeoxmlService) {

        $scope.$$configurations = [];
        $scope.$$activeConfiguration = null;

        $scope.jobs = [];
        $scope.activeJob = null;

        $scope.menuItems = {
            "maps": {},
            "collections": {},
            "operations": {},
            "management": {},
            "data": {},
            "manager": {}
        };


        var reorderElfinArray = function(array) {
            array.sort(function(a, b) {
                return parseInt(a.POS) - parseInt(b.POS);
            });
        };

        /* Handler */
        /* This comes directly from kickstart */
        var updateMenu = function() {

            $('ul.menu').each(function(){
                // add the menu toggle
                $(this).prepend('<li class="menu-toggle"><a href="#"><span class="icon" data-icon="Y"></span> Menu</a></li>');

                // find menu items with children.
                $(this).find('li').has('ul').addClass('has-menu')
                    .find('a:first').append('<span class="arrow">&nbsp;</span>');
            });

            var menuItems =  $('ul.menu li');
            menuItems.off( "mouseenter mouseleave" );

            menuItems.hover(function(){
                    $(this).find('ul:first').stop(true, true).fadeIn('fast');
                    $(this).addClass('hover');
                },
                function(){
                    $(this).find('ul').stop(true, true).fadeOut('slow');
                    $(this).removeClass('hover');
                }
            );
        };


        /* Load global configuration */
        GeoxmlService.getElfin('G20050101000012345', 'G20050101000012345').get()
            .then(function(elfin) {
                /* Load the different configurations */
                var configs = elfin['CARACTERISTIQUE']['FRACTION']['L'];
                reorderElfinArray(configs);

                var defaultConfigPos = elfin['CARACTERISTIQUE']['VALEUR'];

                /* Loop through configs and fill the $$configurations array */
                angular.forEach(configs, function(L) {
                    GeoxmlService.getElfin(L.C[1].C, L.C[2].C).get()
                        .then(function(elfin) {
                            $scope.$$configurations.push(elfin);
                            if (L.POS === defaultConfigPos) {
                                $scope.$$activeConfiguration = elfin;
                            }
                        }, function(response) {
                            console.log("Error with status code", response.status);
                        });
                });


            }, function(response) {
                console.log("Error with status code", response.status);
            }
        );

        /* Activate current configuration */
        $scope.$watch('$$activeConfiguration', function(newVal /*, oldVal, scope */) {
            if (!newVal) {
                return;
            }

            var jobReferences = newVal['CARACTERISTIQUE']['FRACTION']['L'];
            reorderElfinArray(jobReferences);
            angular.forEach(jobReferences, function(L) {
                if (L.POS === "1") {
                    return;
                }
                GeoxmlService.getElfin(L.C[2].C, L.C[1].C).get()
                    .then(function(elfin) {
                        $scope.jobs.push(elfin);
                        if (L.POS === "2") {
                            $scope.activateJob(elfin);
                        }
                    }, function(response) {
                        console.log("Error with status code", response.status);
                    });
            });
        });

        var createMenuStructure = function(elfin) {
            // First reorder the elements
            if (angular.isArray(elfin['CARACTERISTIQUE']['FRACTION']['L'])) {
                reorderElfinArray(elfin['CARACTERISTIQUE']['FRACTION']['L']);
                angular.forEach(elfin['CARACTERISTIQUE']['FRACTION']['L'], function(l) {
                    if (angular.isArray(l.C)) {
                        reorderElfinArray(l.C);
                    }
                });
            }

            var menuStructure = [];
            // Loop over all entries
            angular.forEach(elfin.CARACTERISTIQUE.FRACTION.L, function(l) {
                if (!l.C) return;

                /* Extract group and entry names */
                var groupName = l.C[0].C;
                var entryName = l.C[1].C;

                // Just ignore empty entries for now
                if (!entryName || entryName === '') return;

                if (groupName && groupName !== '') {
                    var existingGroups = menuStructure.filter(function(menuItem) {return menuItem.label === groupName});

                    if (existingGroups.length == 0) {
                        menuStructure.push( {
                            label:groupName,
                            subItems:[]
                        });
                    }

                    existingGroups.forEach(function(group) {
                        group['subItems'].push({
                            label:entryName
                        });
                    });

                } else {
                    menuStructure.push({
                        label:entryName
                    });
                }
            });

            return menuStructure;
        };

        /* Change the job */
        $scope.activateJob = function(job) {
            $scope.activeJob = job;

            /* Load the menus */
            var menuReferences = $scope.activeJob['CARACTERISTIQUE']['FRACTION']['L'];
            reorderElfinArray(menuReferences);

            angular.forEach(menuReferences, function(L) {
                /* Load the menus */
                if (L.C[0].C === "MENU")  {
                    GeoxmlService.getElfin(L.C[2].C, L.C[1].C).get()
                        .then(function(elfin) {
                            var structure = createMenuStructure(elfin);
                            switch(L.POS) {
                                case "3": $scope.menuItems.maps = structure; break;
                                case "4": $scope.menuItems.collections = structure; break;
                                case "5": $scope.menuItems.operations = structure; break;
                                case "6": $scope.menuItems.management = structure; break;
                                case "7": $scope.menuItems.data = structure; break;
                                case "8": $scope.menuItems.manager = structure; break;
                            }

                            updateMenu();
                        }, function(response) {
                            console.log("Error with status code", response.status);
                    });
                }
            })
        };
    }]);

})();