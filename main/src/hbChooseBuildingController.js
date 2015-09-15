(function() {

	
	/**
	 * HbChooseBuildingController definition.
	 * 
	 * To achieve correct behaviour for this controller is non trivial  
	 * due to inherent asynchronous nature of data loading.
	 * It must be correctly identified whether the $scope.buildingModel is:
	 * empty, non-empty or not yet initialised.
	 * 
	 * If initialised and empty then we set it to a default value otherwise its
	 * value must be preserved and selection state: $scope.selected.{building, buildingDisplay}
	 * be updated accordingly.
	 * 
	 * As long as the model initialisation has not completed no update should 
	 * be performed to selection state: $scope.selected.{building, buildingDisplay}
	 * 
	 * The value of $scope.buildingModel is considered not initialised if equal
	 * to undefined.
	 * If equal to null, empty string '' or string 'null' it is considered empty
	 * Any other value is considered non-empty.
	 * 
	 */
	angular.module('hb5').controller(
			'HbChooseBuildingController',
			[ 		'$attrs',
					'$scope',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'$timeout',
					'hbAlertMessages',
					'hbUtil',
					'GeoxmlService',
					'hbQueryService',
					function($attrs, $scope, $modal, $routeParams,
							$location, $log, $timeout, hbAlertMessages, hbUtil, GeoxmlService, hbQueryService) {

						//$log.debug("    >>>> Using HbChooseBuildingController");

						// Check if optional editable property is available
						if ($scope.editable) {
							// We need to deal with text values, make it explicit rather than use == operator.
							if (($scope.editable === 'true') || ($scope.editable === true)) {
								$scope.cannotEdit = false;
							} else {
								$scope.cannotEdit = true;
							}
						} else { // By default the hb-choose-building widget let the user modify the bound buildingModel
							$scope.cannotEdit = false;
						}

						// ========================================================================
						// NEW IMPLEMENTATION START
						// ========================================================================
						
						$scope.modelInitialised = false;
						
						/**
						 *  Wait for the building to have a chance to load before displaying validation error.
						 */
						$scope.validateBuilding = false;
						
						/**
						 * Building linked to the current directive.
						 */
						$scope.selected = { "building" : null , "buildingDisplay" : null };						
						
						/**
						 * Enables building validation with a delay.
						 */
						$scope.enableValidateBuilding = function() {
							$timeout(function(){
								$scope.validateBuilding = true;
							}, 2000, true);
						};						
						
						/**
						 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
						 */
				        $scope.getElfinBuilding = function (collectionId, elfinId) {
				        	
					        GeoxmlService.getElfin(collectionId, elfinId).get()
					        .then(function(buildingElfin) {
					        	// Force CAR array sorting by POS attribute
					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
					        	//       Need review of other similar operations
					        	if ( buildingElfin['CARACTERISTIQUE'] != null && buildingElfin['CARACTERISTIQUE']['CARSET'] != null && buildingElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
					        		hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
					        	}
					        	selectedBuildingUpdate(buildingElfin);
					        	buildingModelsUpdate(buildingElfin);

					        	$scope.enableValidateBuilding();
					        }, function(response) {
					        	var message = "Aucun object IMMEUBLE disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
					        	$log.warn("HbChooseBuildingController - statut de retour: " + response.status + ". Message utilisateur: " + message);
					            hbAlertMessages.addAlert("danger",message);
					            $scope.enableValidateBuilding();
					        });
			        		
			        	};							

			        	/**
			        	 * buildingModel references an ELFIN property with Id, ID_G, GROUPE and NOM properties.
			        	 * This listener is used only for building initialisation 
			        	 */
			        	var buildingModelWatchDeregistration = $scope.$watch('buildingModel.Id', function(newId, oldId) {
			        		
			        		var oldIdValue = (oldId === null) ? 'null' : (oldId === undefined) ? 'undefined' : (oldId.trim() === '' ? 'empty string' : oldId);
			        		var newIdValue = (newId === null) ? 'null' : (newId === undefined) ? 'undefined' : (newId.trim() === '' ? 'empty string' : newId);
			            	
			        		//$log.debug(">>>>>>>>>>>> HbChooseBuildingController - 'buildingModel.Id' LISTENER: oldId = " + oldIdValue + " => newId = " + newIdValue);
			        		if (newId !== undefined) {
			        			if (newId === null || newId.trim() === '' || newId.trim() === 'null') {
			        				//$log.debug(">>>>>>>>>>>> HbChooseBuildingController - 'buildingModel.Id' LISTENER: EMPTY model");
				        			
				        			// No buildingModel.Id set default by name if provided 
//									if ($scope.defaultByName) {
//										setDefaultBuildingByName();
//									}				        			
				        			
				            		// Force validation in create mode as well
				            		$scope.enableValidateBuilding();			        			
				        		} else {
				        			//$log.debug(">>>>>>>>>>>> HbChooseBuildingController - 'buildingModel.Id' LISTENER: DATA for model: newId = " + newId);
				        			// Make sure an building reference is defined before trying to load building elfin
				        			$scope.getElfinBuilding($scope.buildingModel.ID_G, $scope.buildingModel.Id);

				        			// Special case when for instance expected building 'role' does not exist in the system.
					            	if (!$scope.buildingModel == undefined && $scope.buildingModel == null) {
					            		var roleStr = $scope.buildingRole ? $scope.buildingRole : "";
					            		var message = "La sauvegarde du champs lié à la donnée d'acteur " + roleStr + " n'est pas possible. Veuillez notifier votre administrateur de base de données.";
					            		hbAlertMessages.addAlert("danger",message);
					            		$log.error(">>>>>>>>>>>> HbChooseBuildingController - 'buildingModel.Id' LISTENER: - MISSING MANDATORY buildingModel OBJECT found !");
					            	}
				        		}
			        			// Remove listener now that we tried loading the building elfin object.
			        			buildingModelWatchDeregistration();
			        		} else {
			        			//$log.debug(">>>>>>>>>>>> HbChooseBuildingController - 'buildingModel.Id' LISTENER: UNDEFINED model");
			            		// Keep on listening as long as newId is undefined
			        			//$log.debug(">>>>>>>>>>>> HbChooseBuildingController $scope.$watch('buildingModel.Id') => Keep on listening as long as newId is undefined");
			            	}
			            });			        	
			        	
			        	/** ==================================================================
			        	 * Build XPath restriction definition for buildings selection list query
			        	 * Supports commas separated list of values to include or if preceded
			        	 * by a ! sign, to exclude. 
			        	 * ===================================================================
			        	 */
			        	var buildXPathForBuilding = function(roleString) {
			        		
			        		var rolesArray = roleString.split(",");
			        	    var includeRolesArray = new Array();
			        	    var excludeRolesArray = new Array();
			        	    
			        	    for (var i = 0; i < rolesArray.length; i++) {
			        	        var role = rolesArray[i].trim();
			        	        if (role.indexOf('!') == 0) {
			        	            excludeRolesArray.push(role.substring(1, role.length).trim());
			        	        } else {
			        	            includeRolesArray.push(role.trim());
			        	        }
			        	    }
			        	    
			        		var xpathForBuilding = "//ELFIN[@CLASSE='IMMEUBLE' ";
			        		for (var i = 0; i < includeRolesArray.length; i++) {
			        	        if (i === 0 ) {xpathForBuilding += " and ( ";}
			        			xpathForBuilding += "IDENTIFIANT/QUALITE='"+includeRolesArray[i]+"'";
			        			xpathForBuilding += (i===(includeRolesArray.length-1)) ? " ) " : " or ";
			        		}
			        	    for (var i = 0; i < excludeRolesArray.length; i++) {
			        	        if (i === 0 ) {xpathForBuilding += " and ( ";}
			        			xpathForBuilding += "IDENTIFIANT/QUALITE!='"+excludeRolesArray[i]+"'";
			        			xpathForBuilding += (i===(excludeRolesArray.length-1)) ? ") " : " and ";
			        		}    
			        	    xpathForBuilding += "]";
			        	    return xpathForBuilding;
			        	};
			        	
						var xpathForBuilding = null;
						
						// Restrict to provided hb-choose-building-role 
						if ($scope.buildingRole) {
							xpathForBuilding = buildXPathForBuilding($scope.buildingRole);
						} else { // Select all buildings 
							xpathForBuilding = "//ELFIN[@CLASSE='IMMEUBLE']";
						}

						//$log.debug("xpathForBuilding = " + xpathForBuilding);
						
			            // Asychronous buildings preloading
			            hbQueryService.getImmeubles(xpathForBuilding)		
						.then(function(buildings) {
							$log.debug("xpathForBuilding = " + xpathForBuilding);
							$log.debug("Loaded buildings count = " + buildings.length);
								// order buildings by IDENTIFIANT.OBJECTIF, ALIAS
								buildings.sort(function(a, b) {
									return a.IDENTIFIANT.OBJECTIF < b.IDENTIFIANT.OBJECTIF ? -1 :
										a.IDENTIFIANT.OBJECTIF > b.IDENTIFIANT.OBJECTIF ? 1 :
											a.IDENTIFIANT.ALIAS < b.IDENTIFIANT.ALIAS ? -1 : 
												a.IDENTIFIANT.ALIAS > b.IDENTIFIANT.ALIAS ? 1 : 0;
					            });
								$scope.buildings =  buildings;
								$log.debug("Loaded $scope.buildings count = " + $scope.buildings.length);
							},
							function(response) {
								var message = "Le chargement des IMMEUBLEs a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});								
						
						
			            // Wait for buildings list to be loaded before selecting default from it
//			            var buildingsListenerDeregistration = $scope.$watchCollection('buildings', function(newBuildings, oldBuildings) {
//			            	// Proceed only if not the listener initialisation and we wait for default processing
//			            	if (!(newBuildings === oldBuildings )) {
//			            		if ($scope.defaultBuildingProcessWaiting && $scope.defaultBuildingProcessWaiting === true) {
//				            		//$log.debug(">>>>>>>>>>>>>>>>>> buildings LISTENER waiting to set default building by name");
//				            		setDefaultBuildingByName();			            			
//			            		} else {
//			            			//$log.debug(">>>>>>>>>>>>>>>>>> buildings LISTENER NOT waiting to set default building by name");
//			            		}
//			            		// Stop listening to buildings list initialisation
//			            		buildingsListenerDeregistration();
//			            	}
//			            }, true);
			            
			            
						/**
				         * Modal panel to update an elfin reference with the selection from a list of buildings.
				         */
				        $scope.hbChooseBuilding = function () {
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/hbChooseBuildingModalDialog.html',
				                scope: $scope,
				                controller: 'HbChooseBuildingModalController',
				                resolve: {
				                	elfins: function () {
				                    	return $scope.buildings;
				                    },
				                    columnsDefinition: function() {
				                    	return [ { field:"IDENTIFIANT.OBJECTIF", displayName: "No SAI"}, { field:"IDENTIFIANT.ALIAS", displayName: "Adresse"}, { field:"PARTENAIRE.PROPRIETAIRE.NOM", displayName: "Propriétaire"} ];
				                    },
				                    role: function () {
				                    	return $scope.buildingRole;
				                    }
				                },                
				                backdrop: 'static'
				            });
				
				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {
				            	if (selectedElfins && selectedElfins.length > 0) {
						        	/**
						        	 * building model type relates to geoXml.xsd definition.
						        	 * Currently buildings references are stored in dedicated 
						        	 * PARTENAIRE elements all of them of 'PERSONNEType' 
						        	 * as well as in line element ('L') of generic FRACTION
						        	 * of 'MATRICEType' element.
						        	 * For use with line element ('L') of generic FRACTION
						        	 * of 'MATRICEType' element use hb-building-line-converter 
						        	 * directive.
						        	 */
				            		var selectedElfin = selectedElfins[0];
				            		selectedBuildingUpdate(selectedElfin);
					        		buildingModelsUpdate(selectedElfin);

					            	// Notify user current data need saving.
					            	$scope.elfinForm.$setDirty();			
					            	
				            	} else {
				            		//$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                //$log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };
				        
				        
				        /**
				         * Update bound buildingModel, buildingElfinModel provided elfinBuilding
				         */
				        var buildingModelsUpdate = function(elfinBuilding) {
			            	// Update the new ACTOR ids
			            	$scope.buildingModel.ID_G = elfinBuilding.ID_G;
			            	$scope.buildingModel.Id = elfinBuilding.Id;
			            	// According to the GeoXML Schema GROUP and NOM are part of USAGER.
			            	$scope.buildingModel.GROUPE = elfinBuilding.GROUPE;
			            	$scope.buildingModel.NOM = elfinBuilding.IDENTIFIANT.NOM;			            		
		            		
			            	// Reset VALUE which should no more be used.
			            	$scope.buildingModel.VALUE = "";		
			            	
			            	// Provide access to full ACTOR ELFIN model to provide 
			            	// all properties to external scope for display without 
			            	// requiring extra API call.  
			            	$scope.buildingElfinModel = elfinBuilding;
			            	
			            	// Let the scope know the building model update has completed
			            	$scope.modelInitialised = true;
				        };				        
				        
				        /**
				         * Update scope selected building and display string
				         */
				        var selectedBuildingUpdate = function(selectedBuilding) {
				        	// Update selected building instance in scope
				        	$scope.selected.building = selectedBuilding;
				        	// Update selected building display string
				        	$scope.selected.buildingDisplay = $scope.selected.building.IDENTIFIANT.OBJECTIF + " - " + $scope.selected.building.IDENTIFIANT.ALIAS + " - " + $scope.selected.building.PARTENAIRE.PROPRIETAIRE.NOM;
				        };
				        
				        /**
				         * Procedure to set default building by name
				         */
//				        var setDefaultBuildingByName = function() {
//				        	if ($scope.buildings) {
//								var defaultBuildingIsSet = false;
//								for (var i=0; $scope.buildings.length; i++) {
//									var building = $scope.buildings[i];
//									if (building.IDENTIFIANT.NOM == $scope.defaultByName) {
//										//$scope.selected.building = building;
//										selectedBuildingUpdate(building);
//										buildingModelsUpdate(building);
//						        		//defaultModelUpdate();			
//						        		//defaultModelDisplayUpdate();
//										defaultBuildingIsSet = true;
//										break;
//									}
//								}
//								// Done searching for default
//								$scope.defaultBuildingProcessWaiting = false;
//								// Notify user if the search did not succeed.
//								if (!defaultBuildingIsSet) {
//									var message = "L'ACTEUR par défaut correspondant au nom: " + $scope.defaultByName + " n'a pas pu être trouvé parmi les " + buildings.length + " acteurs disponibles.";
//						            hbAlertMessages.addAlert("warning",message);
//								}
//				        	} else {
//				        		$scope.defaultBuildingProcessWaiting = true;
//				        	}
//				        };

					} ]); // End of HbChooseBuildingController definition
	


	/**
	 * HbChooseBuildingModalController definition
	 */
	angular
		.module('hb5')
		.controller(
				'HbChooseBuildingModalController',
				[
						'$scope',
						'$modalInstance',
						'$filter',
						'$log',
						'$timeout',
						'hbUtil',
						'elfins',
						'columnsDefinition',
						'role',
						function($scope, $modalInstance, $filter, $log,
								$timeout, hbUtil, elfins,
								columnsDefinition, role) {
							
							// ============================================================
							// Custom search field used to filter elfins
							// ============================================================    	
							// Default ng-grid showFilter box requires an extra click 
							// to be accessed and is ugly. Let's define our own 
							
							$scope.role = role;
							
							$scope.search = { text: ""};
							
							$scope.$watch('search.text', function() { 
								//$scope.gridOptions.filterOptions.filterText = $scope.search.text;
								$scope.elfins = $filter('immeubleListAnyFilter')(elfins, $scope.search.text , false);
							}, true);
							// ============================================================
							
							
							// ============================================================
							// Manage user selection
							// ============================================================
							
							// Contains the result of user selection. 
							// While gridOptions multiSelect attribute equals false 
							// the array will only be zero or one element. 
							$scope.selectedElfins = [];
							
							// Used to display current selection value
							$scope.currentSelection = null;
							
							// Listener maintaining currentSelection value 
							$scope.$watchCollection('selectedElfins', function(newSelectedElfins , oldSelectedElfins) {
								// Reset current selection if no elfin selected
								if (!newSelectedElfins || newSelectedElfins.length === 0) {
									$scope.currentSelection = null;
								} else if (newSelectedElfins && newSelectedElfins.length > 0) {
									// Assign selected elfin
									$scope.currentSelection = $scope.selectedElfins[0];
								}
							}, true);
							
							
							// ============================================================
							// Manage ng-grid row double click event using gridOptions plugin
							// ============================================================
							
							var ngGridDoubleClickPluginInstance = new ngGridDoubleClickPlugin();
							
							var selectionConfirmed = function() {
								$modalInstance.close($scope.selectedElfins);
							};
							
							$scope.doubleClickListener = function(rowItem) {
								selectionConfirmed();
							};
							
							
							// ng-grid options. See ng-grid API Documentation for details.
							$scope.gridOptions = {
							        data: 'elfins',
							        columnDefs: columnsDefinition,
							        multiSelect: false,
							        selectedItems: $scope.selectedElfins,
							        showColumnMenu: false, // Useful for grouping 
							        showFilter: false, // Ugly look, redefine our own search field
							        filterOptions : { filterText: '', useExternalFilter: true },
							        doubleClickFunction: $scope.doubleClickListener,
							        plugins: [ngGridDoubleClickPluginInstance]
							    };    	
							
							
							$scope.ok = function () {
								selectionConfirmed();
							};
							$scope.cancel = function () {
							    $modalInstance.dismiss('cancel');
							};
							
							
							/**
							 * ngGridDoubleClickPlugin definition - see http://angular-ui.github.io/ng-grid/ API documentation
							 * This plugin provides ng-grid with a new doubleClickFunction called when 
							 * a row is double clicked. The first element of of the selectedItems is 
							 * passed as single function parameter.
							 */
							function ngGridDoubleClickPlugin() {
							
								var self = this;
							    self.$scope = null;
							    self.gridRef = null;
							 
							    // Called when ng-grid directive executes.
							    self.init = function(scope, grid, services) {
							        // Keep references of grid scope and grid object received from ng-grid directive
							        self.$scope = scope;
							        self.gridRef = grid;
							        // Trigger grid events assignment.
							        self.assignEvents();
							    };
							    self.assignEvents = function() {
							        // Set double click event handler to the header container.
							        self.gridRef.$viewport.on('dblclick', self.onDoubleClick);
							    };
							    // Double click function
							    self.onDoubleClick = function(event) {
							    	// Configure new function name and signature, here: doubleClickFunction
							        self.gridRef.config.doubleClickFunction(self.$scope.selectedItems[0]);
							    };
							};
							
							
							var focusOnSearchField = function() {
								$('#searchTextInput').focus();	
							};        
							
							// TODO: FocusTimeout issue. Find a better solution ? 
							$timeout(focusOnSearchField, 250, false);

						}]);	// End of HbChooseBuildingModalController definition
        
})();
