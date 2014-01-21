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
            angular.forEach(menuReferences, function(L) {
                /* Load the menus */
                if (L.C[0].C === "MENU")  {
                    GeoxmlService.getElfin(L.C[2].C, L.C[1].C).get()
                        .then(function(result) {
                            switch(L.POS) {
                                case "3": $scope.menuItems.maps = result['exist:result'].ELFIN; break;
                                case "4": $scope.menuItems.collections = result['exist:result'].ELFIN; break;
                                case "5": $scope.menuItems.operations = result['exist:result'].ELFIN; break;
                                case "6": $scope.menuItems.management = result['exist:result'].ELFIN; break;
                                case "7": $scope.menuItems.data = result['exist:result'].ELFIN; break;
                                case "8": $scope.menuItems.manager = result['exist:result'].ELFIN; break;
                            }

                    }, function(response) {
                            console.log("Error with status code", response.status);
                    });
                }
            })
        };

    }]);

})();