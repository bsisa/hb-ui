(function() {

    var ChooseConfigInstanceCtrl = function ($scope, $modalInstance, $$configurations) {

        $scope.$$configurations = $$configurations;
        $scope.selected = {item: $scope.$$configurations[0]};

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };
    };

    angular.module('hb5').controller('HbResetPwdController', ['$scope', '$modalInstance', '$timeout', '$log', function($scope, $modalInstance, $timeout, $log) {

    	$scope.model = {
    			pwd1: "",
    			pwd2: ""
    	};
    	
		$scope.getCssHasFeedback = function (ngModelController) {
			if (ngModelController) {
				return {
					"has-error" : ngModelController.$dirty && ngModelController.$invalid,
					"has-success" : ngModelController.$dirty && ngModelController.$valid, 
					"has-warning" : ngModelController.$pristine && ngModelController.$invalid // unexpected situation
				};
			} else {
				return {};
			}
		};	    	    	
    	
    	// User ok submission
        $scope.ok = function () {
        	$modalInstance.close($scope.model);
        };
        
    	// Trigger ok submission upon ENTER keystroke
    	$scope.keypressCallback = function($event) {
    		$scope.ok();
    		$event.preventDefault();
    	};        
        
        // User cancel 
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        
        // Force focus to first parameters list field
		$timeout( function () {
			$('#pwd1').focus();	
		}, 250, false);     
        
    }]);    

    angular.module('hb5').controller('ChooseParamsCtrl', ['$scope', '$modalInstance', '$timeout', '$log', 'itemDefinition', function($scope, $modalInstance, $timeout, $log, itemDefinition) {
    	
    	$scope.modalModel = [];
    	// /!\ _.clone performs shallow copy, see: http://underscorejs.org/#clone
    	for (var i = 0; i < itemDefinition.parameters.length; i++) {
			var parameter = itemDefinition.parameters[i];
			$scope.modalModel.push( _.clone(parameter));	
		}
    	
    	// Reset modalModel values to itemDefinition.parameters default value (upon modal opening)
    	for (var i = 0; i < itemDefinition.parameters.length; i++) {
    		$scope.modalModel[i].value = itemDefinition.parameters[i].value;
		}    	
    	
    	// User ok submission
        $scope.ok = function () {
        	$modalInstance.close($scope.modalModel);
        };
        
    	// Trigger ok submission upon ENTER keystroke
    	$scope.keypressCallback = function($event) {
    		$scope.ok();
    		$event.preventDefault();
    	};        
        
        // User cancel 
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        
        // Force focus to first parameters list field
	    var focusOnFirstField = function() {
			$('#field0').focus();	
		};        

		// TODO: FocusTimeout issue with 0 delay time. Any better solution ? 
		$timeout(focusOnFirstField, 250, false);        
        
    }]);
    
    
    angular.module('hb5').controller('MenuController', [
        '$scope', 'GeoxmlService', '$modal', 'hbAlertMessages', 'hbUtil', '$timeout', '$location', '$log', '$window', 'MapService', 'HB_EVENTS', 'userDetails','hbPrintService',
        function($scope, GeoxmlService, $modal, hbAlertMessages, hbUtil, $timeout, $location, $log, $window, MapService, HB_EVENTS, userDetails, hbPrintService) {
        	
      	// Force service initialisation 
        // Check $$activeConfiguration watch for actual initialisation).
       	userDetails.getAbbreviation;
       	
    	// Functions used in alert ui.bootstrap component found in menu.html
    	$scope.getAlerts = hbAlertMessages.getAlerts();
    	$scope.removeAlert = hbAlertMessages.removeAlert;

    	// HB configurations management used when more than a single config is available.
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

        $scope.displayMap = false;

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
            	$log.debug('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * Go home navigation function
         */
    	$scope.home = function() {
    		// Need to encapsulate location path in location url 
    		// to reset any possibly existing search parameters from URL. 
    		$location.url($location.path('/'));
    	};
        

        /**
         * Force show map in FULL mode if not yet visible.
         */
        $scope.switchMapDisplayType = function() {
        	var forcedDisplayType = 'SPLIT';
        	$scope.mapDisplayType = MapService.switchMapDisplayType(forcedDisplayType);
        	$scope.$emit(HB_EVENTS.DISPLAY_MAP_VIEW, forcedDisplayType !== 'HIDDEN');
        };        
        
        
            /**
             * Generic function to display maps
             * @param itemDefinition
             */
        $scope.displayMapContent = function(itemDefinition) {
        	// TODO: activating this lead to unwanted map display. 
        	// Map display is only meaningful in Card or List contexts.
            //if (!MapService.isMapDisplayed()) {
        	//	$scope.switchMapDisplayType();
            //}

            GeoxmlService.getElfin(itemDefinition.parameters[0].idg, itemDefinition.parameters[0].id).get()
                .then(function(elfin) {
                	//"displayMapContentEvent"
                    $scope.$emit(HB_EVENTS.DISPLAY_MAP_CONTENT, elfin);
                }
            );

            $log.debug(itemDefinition);
        };


        /**
         * Directs to hb card corresponding to ELFIN with Id param 
         */
        $scope.findById = function (itemDefinition) {
        	
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
            modalInstance.result.then(function (modalModel) {
                
            	var idParam = modalModel[0].value;
            	
                /* Load global configuration */
                GeoxmlService.getElfinById(idParam).get()      
                  .then(function(elfin) {
                	  var redirectUrl = "/elfin/"+ elfin.ID_G +"/"+elfin.CLASSE+"/"+elfin.Id;
                	  //$location.path(redirectUrl);
                	  $location.path(redirectUrl);
                  }, function(response) {
                  	var errorMessage = (response.status === 404) ? "Aucun objet trouvé pour l'identifiant `Id` = " + idParam : "Error with status code " + response.status + " while getting object for Id = " + idParam;
                   	$log.error(errorMessage);
                    hbAlertMessages.addAlert("danger",errorMessage);
                  }
                );            	
            }, function () {
            	$log.debug('Choose params modal dismissed at: ' + new Date());
            });        	

        };
        
        
        /**
         * Directs to itemDefinition.url link in a new window if required 
         * processing parameters if any.
         */
        $scope.actionLink = function (itemDefinition) {
        	$log.debug("    >>>> actionLink");
        	if (itemDefinition.newWindow && itemDefinition.newWindow === 'true') {
        		$log.debug("    >>>> actionLink - new window");
        		if (itemDefinition.parameters) {
	        		var queryString = hbUtil.buildUrlQueryString(itemDefinition.parameters);
	        		var urlWithQuery = itemDefinition.url + queryString;
	        		$log.debug("    >>>> actionLink - with parameters. URL: " + urlWithQuery);
	        		if (itemDefinition.newWindowName) {
	        			$log.debug("    >>>> actionLink - with new window name: " + itemDefinition.newWindowName);
	        			$window.open(urlWithQuery, itemDefinition.newWindowName);
	        		} else {
	        			$log.debug("    >>>> actionLink - with NO new window name");
	        			$window.open(urlWithQuery);	
	        		}
	        		
        		} else {
        			$log.debug("    >>>> actionLink - without parameters. URL: " + itemDefinition.url);
        			if (itemDefinition.newWindowName) {
        				$log.debug("    >>>> actionLink - with new window name: " + itemDefinition.newWindowName);
        				$window.open(itemDefinition.url, itemDefinition.newWindowName);
        			} else {
        				$log.debug("    >>>> actionLink - with NO new window name");
        				$window.open(itemDefinition.url);	
        			}
        			
        		}
        	} else {
        		$log.debug("    >>>> actionLink - NO new window");
        		if (itemDefinition.parameters) {
        			var searchObject = hbUtil.buildKeyValueObject(itemDefinition.parameters);
        			$log.debug("    >>>> actionLink - with parameters. URL: " + itemDefinition.url + ":: search: " + searchObject);
        			$location.search(searchObject).path(itemDefinition.url);
        		} else {
        			$log.debug("    >>>> actionLink - without parameters. URL: " + itemDefinition.url);
        			$location.path(itemDefinition.url);
        		}
        	}

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
            modalInstance.result.then(function (modalModel) {
                
            	if (itemDefinition.newWindow && itemDefinition.newWindow === 'true') {
            		var queryString = hbUtil.buildUrlQueryString(modalModel);
            		var urlWithQuery = itemDefinition.url + queryString;
            		if (itemDefinition.newWindowName) {
            			$window.open(urlWithQuery,itemDefinition.newWindowName);
            		} else {
            			$window.open(urlWithQuery);	
            		}
            	} else {
            		var searchObject = hbUtil.buildKeyValueObject(modalModel);
            		$location.search(searchObject).path(itemDefinition.url); 
            	}
            }, function () {
            	$log.debug('Choose params modal dismissed at: ' + new Date());
            });
        };        
        
        
        /**
         * Modal panel allowing the current user to reset her password
         */
        $scope.resetPwd = function () {
        	
            var modalInstance = $modal.open({
                templateUrl: '/assets/views/password.html',
                controller: 'HbResetPwdController',       
                backdrop: 'static'
            });

            /**
             * Process modalInstance.close action
             */
            modalInstance.result.then(function (model) {
                
            	$log.debug("ResetPwd with " + model.pwd1 +" / " + model.pwd2);

            }, function () {
            	$log.debug('Reset password modal dismissed at: ' + new Date());
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
                        	$log.error("Error with status code ", response.status, " while processing configs");
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
            	var errorMessage = "Error with status code " + response.status + " while getting hb_init global configuration.";
            	$log.error(errorMessage);
            	hbAlertMessages.addAlert("danger",errorMessage);
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
	            // Get default job position (POS not array index)
	            var defaultJobPos = parseInt(newVal['CARACTERISTIQUE']['CAR1']['VALEUR']);
	            // Holds the result of testing whether the job at defaultJobPos is 
	            // accessible by the current user.
	            var defaultJobPosAllowed = false;
	            
	            // Guarantees jobReferences ordering by POS attribute
	            reorderArrayByPOS(jobReferences);
	            
	            /* Obtain user details from GeoxmlService */
	            // TODO: Review: Use of userDetails service fails due to asynchronous initialisation. 
	            GeoxmlService.getWhoAmI().get().then(function(userDetails) {
 
	            	// Make user details available to MenuController scope 
	            	// to display user name, family name, surname in menu bar. 
	            	$scope.userDetails = userDetails;
	            
		            // jobReferences filtered by access rights
	            	var allowedJobReferences = [];
	            	
	            	// Perform filtering
		            angular.forEach(jobReferences, function(job) {
		            	// Skip label (titles) line located at first position
		            	if (job.POS === 1) {
		                    return;
		                } else {
		                	// Get menu access rights
			            	var jobAccessRights = job.C[5].VALUE.split(",");
			            	// Check whether user is granted necessary role
			            	for (var i = 0; i < jobAccessRights.length; i++) {
			            		var jobAccessRight = jobAccessRights[i];
			            		// If user allowed add menu and break out of this menu item loop
			            		if (_.contains(userDetails.roles,jobAccessRight) ) {
				            		allowedJobReferences.push(job);
				    	            // Test whether the default job is available. Indeed it might be that the 
				    	            // user is not granted the right to access job at defaultJobPos at all. 
				            		if (job.POS === defaultJobPos) {
				            			defaultJobPosAllowed = true;
				            		}
				            		break;
				            	};			            		
			            	}
		                }
		            });
		            
    	            // User is not granted the right to access job at defaultJobPos 
		            // set fall back to first available job.POS
		            if (!defaultJobPosAllowed && allowedJobReferences.length > 0) {
		            	// Set first allowed job as defaultJos by POS
		            	defaultJobPos = allowedJobReferences[0].POS; 
		            }
		            
		            // Guarantees allowedJobReferences ordering by POS attribute
		            reorderArrayByPOS(allowedJobReferences);

		            // Used as $scope.jobs array index
		            var j = 0;
		            angular.forEach(allowedJobReferences, function(job) {
		            	
		                /* Sort cells C by C.POS is mandatory to guarantee correct results. */
		                var jobCells = job.C;
		                reorderArrayByPOS(jobCells);            	
		            	
	            		// Initialise the jobs array with METIER elfin.Id as index lookup value
	                	// solving asynchronous response processing while preserving METIER menu ordering.
	                	// /!\ POS are 1 based while jobs array is 0 based /!\
			            $scope.jobs[j] = job.C[1].VALUE;
			            // Increment j for next loop
			            j = j+1;
            		
		                GeoxmlService.getElfin(jobCells[2].VALUE, jobCells[1].VALUE).get()
		                    .then(function(elfin) {
//		                    	$log.debug(">>>>>> OBTAINED elfin job Id :   " + elfin.Id + " / name: " + elfin.IDENTIFIANT.NOM);
//		                    	$log.debug(">>>>>> OBTAINED elfin job.POS:   " + job.POS + " / defaultJobPos: " + defaultJobPos);
		                    	
		                    	// Solves unsorted asynchronous responses pushed to sorted METIER menu. 
		                    	var jobPosition = $scope.jobs.indexOf(elfin.Id);
		                    	$scope.jobs[jobPosition] = elfin;

		                        // Set active job using provided default job position
		                        if (job.POS === defaultJobPos) {
		                            $scope.activateJob(elfin);
		                        }
		                    }, function(response) {
		                    	var errorMessage = "Error with status code " +  response.status; 
		                        $log.error(errorMessage);
		                        hbAlertMessages.addAlert("danger",errorMessage);
		                    });
		            });
		            // At this time jobs are only promises upon above GeoxmlService.getElfin call completion.
	            }, function(response) {
	            	var errorMessage = "Error with status code " + response.status + " while getting user details information (whoami).";
	            	$log.error(errorMessage);
	            	hbAlertMessages.addAlert("danger","Les informations utilisateur n'ont pu être obtenues.");
	            });		            
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

				Note: Optional actionRights property activate rights restriction if present.


				Simple link navigation
				
				{
					"actionRights": "function-right-key",
				    "type": "link",
				    "url": "/api/melfin/spreadsheet/syntheseContrats.xls?PARAM_1=195"
				}
				

				Modal panel requesting parameters and querying the provided URL with these parameters
				The javascript function must be available in menu.js scope
				if newWindow equals true the result of calling the URL will be opened in a new Window 
				(or Tab depending on browser's configuration)
				if newWindow equals false or is not present the result of calling the URL will be 
				opened in the same window or tab.
				
				{
				    "actionRights": "function-right-key",
				    "type": "modal",
				    "functionName": "myFunctionName",
				    "url": "/the/URL/to/query/to",
				    "newWindow": "true",
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
						actionValue.functionRef = $scope[actionValue.functionName];
					} else {
						//$log.debug("No function name.");
					}
				} catch (e) {
					// TODO: review once menu configurations have be made final
					// deactive meanwhile, to verbose.
//					$log.debug("JSON parse exception for entryName: "
//									+ entryName
//									+ ", group: "
//									+ groupName
//									+ ". Exception: "
//									+ e);
					// Fallback to actual cell string value in case of JSON parsing problem.
					actionValue = L.C[2].VALUE;
				}
                
                // Just ignore empty entries for now
                if (!entryName || entryName === '') return;

                if (groupName && groupName !== '' && hbUtil.isActionAuthorised(actionValue)) {
                	
                    var existingGroups = menuStructure.elements.filter(function(menuItem) {return menuItem.label === groupName;});
                    
                    // No group already exist for this groupName in the current menuStructure.elements.
                    // Create a new group with a first sub-item corresponding to entryName, actionValue.
                    // Groups shall not have action.
                    if (existingGroups.length == 0) {
                    	
                    	// Make sure the subItem is authorised
                    	//if (hbUtil.isActionAuthorised(actionValue)) { 
                    	
		                    menuStructure.elements.push( {
		                        label:groupName,
		                        subItems:[{
		                            label:entryName,
		                            action: actionValue 
		                        }]              
		                    });
                        
                    	//}
                    }

                    // Add sub items to existing group. In case of new group creation 
                    // the existingGroups object does not include the new group as 
                    // filtering happened before group creation.
                    existingGroups.forEach(function(group) {
                    	
                    	// Make sure the subItem is authorised
                    	//if (hbUtil.isActionAuthorised(actionValue)) {                    	
                    	
		                    group['subItems'].push({
		                        label:entryName,
		                        action: actionValue
		                    });
		                    
                    	//}
                    });

                } else {
                	// Regular single menu item without group name specified
                	
                	// Make sure the subItem is authorised
                	if (hbUtil.isActionAuthorised(actionValue)) {                	
                	
	                    menuStructure.elements.push({
	                        label:entryName,
	                        action: actionValue
	                    });
                	}
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
            
        	//$log.debug(">>>>>>>>>>>>>>>>> activateJob called " + job.IDENTIFIANT.NOM +" <<<<<<<<<<<<<<<<<<<<");
        	
        	$scope.activeJob = job;
            hbPrintService.setActiveJob($scope.activeJob);

        	// Expose hbUtil in scope for access by expressions in menu.html view.
//        	$scope.hbUtil = hbUtil;
//        	
        	$scope.activeJobCreateUpdateACL = "";
            
            // Check if data manager rights are defined for this job/business  
            if ($scope.activeJob['CARACTERISTIQUE'].hasOwnProperty('CARSET')) {
            	
            	$scope.activeJobCreateUpdateACL = hbUtil.getCARByPos(job, 1).VALEUR;
            	//$log.debug(">>>>>> activeJobCreateUpdateACL = " + angular.toJson($scope.activeJobCreateUpdateACL));            	
            	
            	if ($scope.activeJob['CARACTERISTIQUE']['CARSET']['CAR'].length > 0) {
                    var jobCarsetCar = $scope.activeJob['CARACTERISTIQUE']['CARSET']['CAR'];
                    reorderArrayByPOS(jobCarsetCar);
                    
                    //$log.debug(">>>> MENU : jobCarsetCar = " + angular.toJson(jobCarsetCar));
                    
                    var dataManagerAccessRightsCreateUpdate = $scope.activeJob['CARACTERISTIQUE']['CARSET']['CAR'][0].VALEUR;
                    
                    var dataManagerAccessRightsRead = "";
                    // We start at 1 as position 0 is reserved for above dataManagerAccessRightsCreateUpdate
                    for (var i = 1; $scope.activeJob['CARACTERISTIQUE']['CARSET']['CAR'].length > i ; i++ ) {
                		dataManagerAccessRightsRead = dataManagerAccessRightsRead + $scope.activeJob['CARACTERISTIQUE']['CARSET']['CAR'][i].VALEUR
                    	if (i !== ($scope.activeJob['CARACTERISTIQUE']['CARSET']['CAR'].length - 1) ) {
                    		dataManagerAccessRightsRead = dataManagerAccessRightsRead + ";"
                    	}
                    }
                    
                	GeoxmlService.setDataManager(dataManagerAccessRightsCreateUpdate, dataManagerAccessRightsRead);            		
            	} else {
            		GeoxmlService.setDataManager("","");
            	}
            } else {
            	GeoxmlService.setDataManager("","");
            }

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
                        	$timeout(updateMenu, 0, false);
                        	//updateMenu(); Reproduces former bug (function applied before DOM update completion)
                        } else {
                        	//$log.debug("Creating menu nb " + actualMenuRefProcessedCount + "/" + actualMenuRef.length);                            	
                        }
                    }, function(response) {
                    	//TODO: Add alert
                    	var errorMessage = "Error with status code" + response.status + " while processing menus configurations.";
                        $log.error(errorMessage);
                        hbAlertMessages.addAlert("danger",errorMessage);
                });
            });
            
            // Get path from selected job configuration
            var dashboardUri = hbUtil.getDashboarUri(job);

   			// Redefine searchObj as empty to get rid of sticky URL parameters 
   			// Note former solution $location.url($location.path(dashboardUri)); 
   			// to this problem triggers an unwanted reload of welcome page
    		var searchObj = {};
			$location.search(searchObj).path( dashboardUri );
        };
        

        
    }]);

})();
