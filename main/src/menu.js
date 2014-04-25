(function() {

    var ChooseConfigInstanceCtrl = function ($scope, $modalInstance, $$configurations) {

        $scope.$$configurations = $$configurations;
        $scope.selected = {item: $scope.$$configurations[0]};

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };


    };


    angular.module('hb5').controller('ChooseParamsCtrl', ['$scope', '$modalInstance', 'itemDefinition', function($scope, $modalInstance, itemDefinition) {
    	$scope.itemDefinition = itemDefinition;
        $scope.ok = function () {
            $modalInstance.close($scope.itemDefinition);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
    
    /**
     * Directive for dynamic drop down menus.
     * 
     * Note: When hbDropdownMenuLabel and hbDropdownMenuItems are scoped as read only using @
     * they fail to be bound as properties references but are considered pure strings instead.
     * This behaviour is likely due to the "relatively" long time necessary for menu properties 
     * to be dynamically initialised (menus structure being loaded from database).
     */
    angular.module('hb5').directive('hbDropdownMenu', function () {

		return {
		    restrict: 'A',
			templateUrl : "/assets/views/hbDropdownMenu.html",
			replace : true,
			scope : {
				'menuIconClass' : '@hbDropdownMenuIconClass',
				'menuLabel' : '=hbDropdownMenuLabel',  
				'menuItems' : '=hbDropdownMenuItems'   
			},
			link : function ($scope, $element, $attrs) {
//				$scope.$watch('menuLabel', function(value){
//					console.log("menuLabel VALUE changed to " + value );
//				});
//				$scope.$watch('menuItems', function(value){
//					console.log("menuItems VALUE changed to " + value );
//					
//				});
			}
		};
	
    });
    
    angular.module('hb5').controller('MenuController', ['$scope', 'GeoxmlService', '$modal', 'sharedMessages', 'hbUtil', '$timeout', '$location', '$window', function($scope, GeoxmlService, $modal, sharedMessages, hbUtil, $timeout, $location, $window) {

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
            	templateUrl: '/assets/views/chooseConfiguration.html',
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
         * Generic modal panel to fill a list of parameters before requesting a resource (URL)
         * It relies on itemDefinition JSON format. 
         */
        $scope.chooseParams = function (itemDefinition) {
        	
            var modalInstance = $modal.open({
                templateUrl: '/assets/views/chooseParams.html',
                scope: $scope,
                controller: 'ChooseParamsCtrl',
                resolve: {
                	itemDefinition: function () {
                    	return itemDefinition;
                    }               
                },                
                backdrop: 'static'
            });

            /**
             * Process modalInstance.close action
             */
            modalInstance.result.then(function (result) {
                var queryString = hbUtil.buildUrlQueryString(result.parameters);
            	var urlWithQuery = result.url + queryString;
            	$window.open(urlWithQuery);
            }, function () {
                console.log('Choose params modal dismissed at: ' + new Date());
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

            var menuStructure = {
            		"label" : elfin['IDENTIFIANT']['NOM'],
            		"elements" : []
            };
            // Loop over all menu entries
            angular.forEach(menuLines, function(L) {
                if (!L.C) return;

                /* Extract group and entry names */
                var groupName = L.C[0].VALUE;
                var entryName = L.C[1].VALUE;
                var actionValue = L.C[2].VALUE;
                /* actionValue is expected to contain JSON menu item format as, for instance: 

				Simple link navigation
				
				{
				    "type": "link",
				    "url": "/api/melfin/spreadsheet/syntheseContrats.xls?PARAM_1=195"
				}
				
				Modal panel requesting parameters and querying the provided URL with these parameters
				The javascript function must be available in menu.js scope
				
				{
				    "type": "modal",
				    "functionName": "myFunctionName",
				    "url": "/the/URL/to/query/to",
				    "parameters": [
				        {
				            "label": "First parameter",
				            "name": "PARAM_1",
				            "value": ""
				        },
				        {
				            "label": "Other parameter",
				            "name": "OTHER",
				            "value": ""
				        }
				    ]
				}
                 * */

				try {
					actionValue = angular.fromJson(L.C[2].VALUE);
					if (actionValue.functionName) {
						//console.log("Refer to function: " + actionValue.functionName);
						actionValue.functionRef = $scope[actionValue.functionName];
					} else {
						//console.log("No function name.");
					}
				} catch (e) {
					console
							.log("JSON parse exception for entryName: "
									+ entryName
									+ ", group: "
									+ groupName
									+ ". Exception: "
									+ e);
					// Fallback to actual cell string value in case of JSON parsing problem.
					actionValue = L.C[2].VALUE;
				}
                
                // Just ignore empty entries for now
                if (!entryName || entryName === '') return;

                if (groupName && groupName !== '') {
                	
                    var existingGroups = menuStructure.elements.filter(function(menuItem) {return menuItem.label === groupName;});
                    
                    // No group already exist for this groupName in the current menuStructure.elements.
                    // Create a new group with a first sub-item corresponding to entryName, actionValue.
                    // Groups shall not have action.
                    if (existingGroups.length == 0) {
                    	
                        menuStructure.elements.push( {
                            label:groupName,
                            subItems:[{
                                label:entryName,
                                action: actionValue 
                            }]              
                        });
                    }

                    // Add sub items to existing group. In case of new group creation 
                    // the existingGroups object does not include the new group as 
                    // filtering happened before group creation.
                    existingGroups.forEach(function(group) {
                        group['subItems'].push({
                            label:entryName,
                            action: actionValue
                        });
                    });

                } else {
                	// Regular single menu item without group name specified
                    menuStructure.elements.push({
                        label:entryName,
                        action: actionValue
                    });
                }
            });

            // Post process menuStructure.elements to convert single element groups to regular 
            // single menu item.
            menuStructure.elements.forEach(function(group) {
            	if (group.subItems != null) {
            		if (group.subItems.length == 0) {
            			// This is unlikely but nullify subItems array for consistent 
            			// view rendering in case subItems appears in tests.
            			group.subItems = null;
            		} else if (group.subItems.length == 1) {
            			// Single sub-item group: Transform back to regular menu item.
            			// Make sub-item label regular menu item
            			group.label = group.subItems[0].label;
            			// Create regular menu item action and make it as sub-item action
            			group.action = group.subItems[0].action;
            			// Remove/nullify group subItems to make it a regular menu item.
            			group.subItems = null;
            		} else {
            			// More than one sub-item: do nothing
            		}
            	} else {
        			// No sub-item, regular menu item: do nothing
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

            /* Deal with MENU only */
            var actualMenuRef = menuReferences.filter(function(L) {
	            	// Sort menus cells
	            	reorderArrayByPOS(L.C);
            		return L.C[0].VALUE === "MENU";
            	});
            
            // Allow calling updateMenu function only once for all menus.
            var actualMenuRefProcessedCount = 0;

            // Load each menu configurations in turn
            angular.forEach(actualMenuRef, function(L) {

                /* Load the menus */
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
                        
                        actualMenuRefProcessedCount += 1;
                        
                        // Only call updateMenu once and enclosed in $timeout service to 
                        // fix function applied before DOM update completion.
                        if (actualMenuRefProcessedCount == actualMenuRef.length) {
                        	//console.log("ALL menus ("+actualMenuRef.length+") created! Invoke updateMenu in 0 seconds v3!!!");
                        	$timeout(updateMenu, 0, false);
                        	//updateMenu(); Reproduces former bug (function applied before DOM update completion)
                        } else {
                        	//console.log("Creating menu nb " + actualMenuRefProcessedCount + "/" + actualMenuRef.length);                            	
                        }
                    }, function(response) {
                        console.log("Error with status code", response.status);
                });
            });
        };
    }]);

})();
