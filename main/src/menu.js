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
        }

        /* Handler */
        var updateMenu = function() {
            $('ul.menu li').off( "mouseenter mouseleave" );
            $('ul.menu li').hover(function(){
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
            .then(function(result) {
                /* Load the different configurations */
                var elfin = result['exist:result'].ELFIN;
                var configs = elfin.CARACTERISTIQUE.FRACTION.L;
                reorderElfinArray(configs);

                var defaultConfigPos = elfin.CARACTERISTIQUE.VALEUR;

                /* Loop through configs and fill the $$configurations array */
                angular.forEach(configs, function(L) {
                    GeoxmlService.getElfin(L.C[1].C, L.C[2].C).get()
                        .then(function(result) {
                            $scope.$$configurations.push(result['exist:result'].ELFIN);
                            if (L.POS === defaultConfigPos) {
                                $scope.$$activeConfiguration = result['exist:result'].ELFIN;
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
        $scope.$watch('$$activeConfiguration', function(newVal, oldVal, scope) {
            if (!newVal) {
                return;
            }

            var jobReferences = newVal.CARACTERISTIQUE.FRACTION.L;
            reorderElfinArray(jobReferences);
            angular.forEach(jobReferences, function(L) {
                if (L.POS === "1") {
                    return;
                }
                GeoxmlService.getElfin(L.C[2].C, L.C[1].C).get()
                    .then(function(result) {
                        $scope.jobs.push(result['exist:result'].ELFIN);
                        if (L.POS === "2") {
                            $scope.activateJob(result['exist:result'].ELFIN);
                        }
                        updateMenu();
                    }, function(response) {
                        console.log("Error with status code", response.status);
                    });
            });
        });

        $scope.activateJob = function(job) {
            $scope.activeJob = job;

            /* Load the menus */
            var menuReferences = $scope.activeJob.CARACTERISTIQUE.FRACTION.L;
            reorderElfinArray(menuReferences);

            angular.forEach(menuReferences, function(L) {
                /* Load the menus */
                if (L.C[0].C === "MENU")  {
                    GeoxmlService.getElfin(L.C[2].C, L.C[1].C).get()
                        .then(function(result) {
                            var elfin = result['exist:result'].ELFIN;
                            switch(L.POS) {
                                case "3": $scope.menuItems.maps = elfin; break;
                                case "4": $scope.menuItems.collections = elfin; break;
                                case "5": $scope.menuItems.operations = elfin; break;
                                case "6": $scope.menuItems.management = elfin; break;
                                case "7": $scope.menuItems.data = elfin; break;
                                case "8": $scope.menuItems.manager = elfin; break;
                            }
                            if (angular.isArray(elfin.CARACTERISTIQUE.FRACTION.L)) {
                                reorderElfinArray(elfin.CARACTERISTIQUE.FRACTION.L);
                                angular.forEach(elfin.CARACTERISTIQUE.FRACTION.L, function(l) {
                                    if (angular.isArray(l.C)) {
                                        reorderElfinArray(l.C);
                                    }
                                });
                            }

                    }, function(response) {
                            console.log("Error with status code", response.status);
                    });
                }
            })
        };

    }]);

})();