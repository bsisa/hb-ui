(function() {

	
	/**
	 * HbChooseBuildingController definition.
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

						/**
						 * Initialisation state information
						 */
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
			        	 * buildingElfinModel references an ELFIN of CLASSE IMMEUBLE
			        	 * This listener is used only for building initialisation from model binding.
			        	 */
			        	var buildingElfinModelWatchDeregistration = $scope.$watch('buildingElfinModel.Id', function(newId, oldId) {
			        		
			        		$log.debug(">>>>>>>>>>>> HbChooseBuildingController - 'buildingElfinModel.Id' LISTENER: oldId = " + oldId + " => newId = " + newId);
			        		
			        		if (!angular.isUndefined($scope.buildingElfinModel) && newId !== oldId) {
					        	selectedBuildingUpdate($scope.buildingElfinModel);
					        	buildingModelsUpdate($scope.buildingElfinModel);
			            		// Force validation in create mode as well
			            		$scope.enableValidateBuilding();
			        			// Remove listener now that we tried loading the building elfin object.
			            		buildingElfinModelWatchDeregistration();			            		
			        		}

			            });			        	

			            // Asychronous buildings preloading and sorting
			            hbQueryService.getImmeubles("//ELFIN[@CLASSE='IMMEUBLE']")		
						.then(function(buildings) {
								// order buildings by IDENTIFIANT.OBJECTIF, ALIAS
								buildings.sort(function(a, b) {
									return a.IDENTIFIANT.OBJECTIF < b.IDENTIFIANT.OBJECTIF ? -1 :
										a.IDENTIFIANT.OBJECTIF > b.IDENTIFIANT.OBJECTIF ? 1 :
											a.IDENTIFIANT.ALIAS < b.IDENTIFIANT.ALIAS ? -1 : 
												a.IDENTIFIANT.ALIAS > b.IDENTIFIANT.ALIAS ? 1 : 0;
					            });
								$scope.buildings =  buildings;
							},
							function(response) {
								var message = "Le chargement des IMMEUBLEs a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});								

			            
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
				                    }
				                },                
				                backdrop: 'static'
				            });
				
				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {

				            	if (selectedElfins && selectedElfins.length > 0) {

				            		// We deal with single selection only
				            		var selectedElfin = selectedElfins[0];
				            		selectedBuildingUpdate(selectedElfin);
					        		buildingModelsUpdate(selectedElfin);

					        		// Manually trigger angular field and form states (valid, pristine,...)
					            	$scope.elfinForm[$scope.buildingIdName].$setViewValue($scope.elfinForm[$scope.buildingIdName].$viewValue)
				            	} else {
				            		//$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                //$log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };
				        
				        
				        /**
				         * Update bound buildingElfinModel
				         */
				        var buildingModelsUpdate = function(elfinBuilding) {
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
						function($scope, $modalInstance, $filter, $log,
								$timeout, hbUtil, elfins,
								columnsDefinition) {
							
							// ============================================================
							// Custom search field used to filter elfins
							// ============================================================    	
							// Default ng-grid showFilter box requires an extra click 
							// to be accessed and is ugly. Let's define our own 
							
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
