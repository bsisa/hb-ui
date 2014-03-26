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

        
        /**
         * First came from kickstart but is now unrelated.
         * htmlkick start has-menu, arrow and other related 
         * classes are now directly declared in menu.html
         * 
         * The current updateMenu task is to make ui.bootstrap 
         * dropdown menu with onhoveropen class display on hover
         * adding/removing the boostrap 'open' class.
         * This is used for Hyperbird sub-menus.
         * 
         * fadeIn/fadeOut is dealt with to improve UX while 
         * navigating menus and sub-menus.
         */
        var updateMenu = function() {

        	// Searching for custom class onhoveropen
        	var menuItems =  $('li.onhoveropen');
        	//console.log(">>>>> li.onhoveropen = " + menuItems.length);
        	menuItems.hover(
        		function(){
		          $(this).find('ul:first').stop(true, true).fadeIn('fast');
		          $(this).addClass('open');
	          	},
	          	function(){
		          $(this).find('ul').stop(true, true).fadeOut('slow');
		          $(this).removeClass('open');
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
            	// No change detected
                return;
            } else {
            	// Reset jobs list
            	$scope.jobs = new Array();

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
	            // Guarantees jobReferences ordering by POS attribute
	            reorderArrayByPOS(jobReferences);
	           
	            // Get default job position in jobReferences array
	            var defaultJobPos = parseInt(newVal['CARACTERISTIQUE']['CAR1']['VALEUR']);
	            
	            angular.forEach(jobReferences, function(job) {
	
	                /* Sort cells C by C.POS is mandatory to guarantee correct results. */
	                var jobCells = job.C;
	                reorderArrayByPOS(jobCells);            	
	            	
	            	// Skip label (titles) line located at first position
	                if (job.POS === 1) {
	                    return;
	                } else {
		                
	            		// Initialise the jobs array with METIER elfin.Id as index lookup value
	                	// solving asynchronous response processing while preserving METIER menu ordering.
	                	// POS are 1 based while jobs array is 0 based.
	            		$scope.jobs[job.POS-2] = job.C[1].VALUE; 	
		                
		                //console.log(">>>>>> REQUESTING elfin job Id: " + jobCells[1].VALUE + " / name: "+jobCells[4].VALUE );
		                GeoxmlService.getElfin(jobCells[2].VALUE, jobCells[1].VALUE).get()
		                    .then(function(elfin) {
		                    	//console.log("<<<<<< OBTAINED elfin job Id:   " + elfin.Id + " / name: " + elfin.IDENTIFIANT.NOM);
		                    	
		                    	// Solves unsorted asynchronous responses pushed to sorted METIER menu. 
		                    	var jobPosition = $scope.jobs.indexOf(elfin.Id);
		                    	$scope.jobs[jobPosition] = elfin;
		                    	
		                        // Set active job using provided default job position
		                        if (job.POS === defaultJobPos) {
		                            $scope.activateJob(elfin);
		                        }
		                    }, function(response) {
		                        console.log("Error with status code", response.status);
		                    });
	                }
	            });
	            // At this time jobs are only promises upon above GeoxmlService.getElfin call completion.
            }
        });
        

        var createMenuStructure = function(elfin) {
        	
        	var menuLines = elfin['CARACTERISTIQUE']['FRACTION']['L'];
        	/* Sort menu lines by POS */
            if (angular.isArray(menuLines)) {
                reorderArrayByPOS(menuLines);
                /* Sort cells of each menu line */
                angular.forEach(menuLines, function(L) {
                	var lineCells = L.C;
                    if (angular.isArray(lineCells)) {
                        reorderArrayByPOS(lineCells);
                    }
                });
            }

            var menuStructure = [];
            // Loop over all menu entries
            angular.forEach(menuLines, function(L) {
                if (!L.C) return;

                /* Extract group and entry names */
                var groupName = L.C[0].VALUE;
                var entryName = L.C[1].VALUE;
                var actionValue = L.C[2].VALUE;
                
                // Just ignore empty entries for now
                if (!entryName || entryName === '') return;

                if (groupName && groupName !== '') {
                    var existingGroups = menuStructure.filter(function(menuItem) {return menuItem.label === groupName;});

                    if (existingGroups.length == 0) {
                    	console.log("CREATE GROUP             = " + groupName);
                    } else if (existingGroups.length == 1) {
                    	console.log("GROUP EXISTS = " + groupName);
                    	if (existingGroups[0].subItems.length == 0) {
                    		console.log("No sub item yet !");
                    	} else {
                    		console.log( existingGroups[0].subItems.length + " sub items already!");
                    	}
                    } else {
                    	console.log("NEVER HAPPEN!!!!");
                    }
                    
                    // No group already exist for this groupName in the current menuStructure, create one
                    // The action linked to this group is the one of the first entry action found for this
                    // group. TODO: confirm this behaviour is correct in all situations (with and without sub items)
                    if (existingGroups.length == 0) {
                    	
                        menuStructure.push( {
                            label:groupName,
                            action: "no action for group",
                            subItems:[{
                                label:entryName,
                                action: actionValue
                            }]              
                        });
                    }

                    // We do not enter here if the group was just created above, before existingGroups filtering.
                    existingGroups.forEach(function(group) {
                    	
                        group['subItems'].push({
                            label:entryName,
                            action: actionValue
                        });
                    });

                } else {
                	console.log("No groupName for entry  = " + entryName);
                    menuStructure.push({
                        label:entryName,
                        action: actionValue
                    });
                }
            });

            //TODO: post process menuStructure for single element groups
            console.log(">>>>>>>>>>>>>>>> POST-PROCESSING START v7 <<<<<<<<<<<<<<<<<<<");
            menuStructure.forEach(function(group) {
            	console.log("Group: " + group.label);
            	console.log("  act: " + group.action);
            	if (group.subItems != null) {
            		console.log("  sub: " + group.subItems.length);
            		if (group.subItems.length == 0) {
            			console.log("UNEXPECTED ZERO LENGTH GROUP...");
            			//group.subItems = null;
            		} else if (group.subItems.length == 1) {
            			console.log("SINGLE ITEM GROUP => TRANSFORM BACK TO ITEM...");
            			console.log("SINGLE ITEM is: " + group.subItems[0].label +"::"+group.subItems[0].action);
            			group.label = group.subItems[0].label;
            			group.action = group.subItems[0].action;
            			group.subItems = null;
            		} else {
            			console.log(group.subItems.length + " ITEMS GROUP => LET IT BE...");
            		}
            	} else {
            		console.log("  sub: NONE");
            	}
            });
            console.log(">>>>>>>>>>>>>>>> POST-PROCESSING END   <<<<<<<<<<<<<<<<<<<");
            
            
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
                            //console.log("Calling menu update for swith case = " + L.POS);
                            updateMenu();
                        }, function(response) {
                            console.log("Error with status code", response.status);
                    });
                }
            });
        };
    }]);

})();