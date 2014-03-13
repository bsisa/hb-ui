(function() {

    var ChooseConfigInstanceCtrl = function ($scope, $modalInstance, $$configurations) {

        $scope.$$configurations = $$configurations;
        $scope.selected = {item: $scope.$$configurations[0]};

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };


    };


    angular.module('hb5').controller('MenuController', ['$scope', 'GeoxmlService', '$modal', 'sharedMessages', 'hbUtil', function($scope, GeoxmlService, $modal, sharedMessages, hbUtil) {

    	$scope.sharedStatusMessage = sharedMessages.getStatusMessage();
    	$scope.sharedErrorMessage = sharedMessages.getErrorMessage();

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


        $scope.chooseConfiguration = function () {

            var modalInstance = $modal.open({
                templateUrl: 'chooseConfiguration.html',
                controller: ChooseConfigInstanceCtrl,
                resolve: {
                    $$configurations: function () {
                        return $scope.$$configurations;
                    }
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function (selection) {
                $scope.$$activeConfiguration = selection;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };



        /**
         * Sort any array by its elements POS property.
         * Assumes the array elements possess POS property of Int type.  
         */
        var reorderArrayByPOS = hbUtil.reorderArrayByPOS;
//        var reorderArrayByPOS = function(array) {
//            array.sort(function(a, b) {
//                return parseInt(a.POS) - parseInt(b.POS);
//            });
//        };

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


        /* Obtain global configuration references dynamically from GeoxmlService */
        GeoxmlService.getConfig().get().then(function(config) {
            var hbInitId = config['config']['hb_init_ref']['Id'];
            var hbInitID_G = config['config']['hb_init_ref']['ID_G'];
          /* Load global configuration */
          GeoxmlService.getElfin(hbInitID_G, hbInitId).get()      
            .then(function(elfin) {
                /* Load the different configurations */
                var configs = elfin['CARACTERISTIQUE']['FRACTION']['L'];
                reorderArrayByPOS(configs);

                // Type must be int to have === check work with L.POS
                var defaultConfigPos = parseInt(elfin['CARACTERISTIQUE']['CAR1']['VALEUR']);
                var configCountDown = configs.length;
                
                /* Loop through configs and fill the $$configurations array */
                angular.forEach(configs, function(L) {
                	GeoxmlService.getElfin(L.C[1].VALUE, L.C[2].VALUE).get()
                        .then(function(elfin) {
                            $scope.$$configurations.push(elfin);
                            if (L.POS === defaultConfigPos) {
                                $scope.$$activeConfiguration = elfin;
                            }
                            configCountDown--;
                            if (configCountDown === 0 && configs.length > 1) {
                            	$scope.chooseConfiguration();
                            }
                        }, function(response) {
                            console.log("Error with status code ", response.status, " while processing configs");
                            configCountDown--;
                            //TODO: Check it is wise to prompt for configuration choice in the event of errors.
                            // While we have setErrorInterceptor defined on Restangular we should anyway never 
                            // get here.
                            if (configCountDown === 0 && configs.length > 1) {
                        		$scope.chooseConfiguration();
                        	}
                        });
                });


            }, function(response) {
                console.log("Error with status code " + response.status + " while getting hb_init global configuration.");
            }
          );
        }
        );

        /* Activate current configuration */
        $scope.$watch('$$activeConfiguration', function(newVal /*, oldVal, scope */) {
            if (!newVal) {
                return;
            }

            /**
             * Jobs (METIER) records structure are defined as a table. 
             * The table is contained in an ELFIN as a list of lines resulting of:
             * ELFIN['CARACTERISTIQUE']['FRACTION']['L']    
             * The first line L[0] (if ordered by L.POS) or L.POS === 1 contains 
             * the labels for each cell C[0] to C[5]  
             * C[0] Classe
             * C[1] Id
             * C[2] ID_G (ID Groupe)
             * C[3] Nom (Job name in the jobs menu)
             * C[4] Groupe (Job group name in the jobs menu)
             * C[5] Acces (Role/Group having access to this job) 
             */            
            var jobReferences = newVal['CARACTERISTIQUE']['FRACTION']['L'];
            reorderArrayByPOS(jobReferences);
            // Get default job position in jobReferences array
            var defaultJobPos = parseInt(newVal['CARACTERISTIQUE']['CAR1']['VALEUR']);
            angular.forEach(jobReferences, function(L) {
            	// Skip label line located at first position
                if (L.POS === 1) {
                    return;
                }
                /* Sort cells C by C.POS is mandatory to guarantee correct results. */
                var jobCells = L.C;
                reorderArrayByPOS(jobCells);
                
                GeoxmlService.getElfin(jobCells[2].VALUE, jobCells[1].VALUE).get()
                    .then(function(elfin) {
                        $scope.jobs.push(elfin);
                        // Set active job using provided default job position
                        if (L.POS === defaultJobPos) {
                            $scope.activateJob(elfin);
                        }
                    }, function(response) {
                        console.log("Error with status code", response.status);
                    });
            });
        });

        var createMenuStructure = function(elfin) {
        	
        	var menuLines = elfin['CARACTERISTIQUE']['FRACTION']['L'];
        	/* Sort menu lines by POS */
            if (angular.isArray(menuLines)) {
                reorderArrayByPOS(menuLines);
                /* Sort cells of each menu line */
                angular.forEach(menuLines, function(l) {
                	var lineCells = l.C;
                    if (angular.isArray(lineCells)) {
                        reorderArrayByPOS(lineCells);
                    }
                });
            }

            var menuStructure = [];
            // Loop over all menu entries
            angular.forEach(menuLines, function(l) {
                if (!l.C) return;

                /* Extract group and entry names */
                var groupName = l.C[0].VALUE;
                var entryName = l.C[1].VALUE;
                var actionValue = l.C[2].VALUE;
                
                // Just ignore empty entries for now
                if (!entryName || entryName === '') return;

                if (groupName && groupName !== '') {
                    var existingGroups = menuStructure.filter(function(menuItem) {return menuItem.label === groupName;});

                    //TODO: double-check groups logic .
                    // actionValue should not be there for group with subItems (post processing required?)
                    if (existingGroups.length == 0) {
                        menuStructure.push( {
                            label:groupName,
                            action: actionValue,
                            subItems:[]                        
                        });
                    }

                    existingGroups.forEach(function(group) {
                        group['subItems'].push({
                            label:entryName,
                            action: actionValue
                        });
                    });

                } else {
                    menuStructure.push({
                        label:entryName,
                        action: actionValue
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
            reorderArrayByPOS(menuReferences);

            angular.forEach(menuReferences, function(L) {
            	// Sort menus cells
            	reorderArrayByPOS(L.C);
                /* Load the menus */
                if (L.C[0].VALUE === "MENU")  {
                	GeoxmlService.getElfin(L.C[2].VALUE, L.C[1].VALUE).get()
                        .then(function(elfin) {
                            var structure = createMenuStructure(elfin);
                            switch(L.POS) {
                                case 3: $scope.menuItems.maps = structure; break;
                                case 4: $scope.menuItems.collections = structure; break;
                                case 5: $scope.menuItems.operations = structure; break;
                                case 6: $scope.menuItems.management = structure; break;
                                case 7: $scope.menuItems.data = structure; break;
                                case 8: $scope.menuItems.manager = structure; break;
                            }

                            updateMenu();
                        }, function(response) {
                            console.log("Error with status code", response.status);
                    });
                }
            });
        };
    }]);

})();