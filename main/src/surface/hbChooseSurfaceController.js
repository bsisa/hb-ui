(function() {

	
	/**
	 * HbChooseSurfaceController definition.
	 * 
	 */
	angular.module('hb5').controller(
			'HbChooseSurfaceController',
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

						// Protects against load latency.
						$scope.surfacesLoaded = false;
				
						// Check if optional editable property is available
						if ($scope.editable) {
							// We need to deal with text values, make it explicit rather than use == operator.
							if (($scope.editable === 'true') || ($scope.editable === true)) {
								$scope.cannotEdit = false;
							} else {
								$scope.cannotEdit = true;
							}
						} else { // By default the hb-choose-surface widget let the user modify the bound surfaceModel
							$scope.cannotEdit = false;
						}

						$scope.selectionEnabled = function() {
							return (!$scope.cannotEdit && $scope.surfacesLoaded);
						};
						
						/**
						 * Initialisation state information
						 */
						$scope.modelInitialised = false;
						
						/**
						 *  Wait for the surface to have a chance to load before displaying validation error.
						 */
						$scope.validateSurface = false;
						
						/**
						 * Surface linked to the current directive.
						 */
						$scope.selected = { "surface" : null , "surfaceDisplay" : null };						
						
						/**
						 * Enables surface validation with a delay.
						 */
						$scope.enableValidateSurface = function() {
							$timeout(function(){
								$scope.validateSurface = true;
							}, 2000, true);
						};						
						
						/**
						 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
						 */
				        $scope.getElfinSurface = function (collectionId, elfinId) {
				        	
					        GeoxmlService.getElfin(collectionId, elfinId).get()
					        .then(function(surfaceElfin) {
					        	// Force CAR array sorting by POS attribute
					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
					        	//       Need review of other similar operations
					        	if ( surfaceElfin['CARACTERISTIQUE'] != null && surfaceElfin['CARACTERISTIQUE']['CARSET'] != null && surfaceElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
					        		hbUtil.reorderArrayByPOS(surfaceElfin['CARACTERISTIQUE']['CARSET']['CAR']);
					        	}
					        	selectedSurfaceUpdate(surfaceElfin);
					        	surfaceModelsUpdate(surfaceElfin);

					        	$scope.enableValidateSurface();
					        }, function(response) {
					        	var message = "Aucun object SURFACE disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
					        	$log.warn("HbChooseSurfaceController - statut de retour: " + response.status + ". Message utilisateur: " + message);
					            hbAlertMessages.addAlert("danger",message);
					            $scope.enableValidateSurface();
					        });
			        		
			        	};							

			        	/**
			        	 * surfaceElfinModel references an ELFIN of CLASSE SURFACE
			        	 * This listener is used only for surface initialisation from model binding.
			        	 */
			        	var surfaceElfinModelWatchDeregistration = $scope.$watch('surfaceElfinModel.Id', function(newId, oldId) {
			        		
			        		if (!angular.isUndefined($scope.surfaceElfinModel) && newId !== oldId) {
					        	selectedSurfaceUpdate($scope.surfaceElfinModel);
					        	surfaceModelsUpdate($scope.surfaceElfinModel);
			            		// Force validation in create mode as well
			            		$scope.enableValidateSurface();
			        			// Remove listener now that we tried loading the surface elfin object.
			            		surfaceElfinModelWatchDeregistration();			            		
			        		}

			            });			        	

			            // Asychronous surfaces preloading and sorting
			            // TODO: REPLACE WITH SURFACE CALLS...
			        	hbQueryService.getLocationUnits("//ELFIN[@CLASSE='SURFACE']")		
						.then(function(surfaces) {

								// order surfaces by IDENTIFIANT.OBJECTIF, IDENTIFIANT.ALIAS, IDENTIFIANT.NOM, PARTENAIRE.PROPRIETAIRE.NOM
								surfaces.sort(function(a, b) {
									return a.IDENTIFIANT.OBJECTIF < b.IDENTIFIANT.OBJECTIF ? -1 :
										a.IDENTIFIANT.OBJECTIF > b.IDENTIFIANT.OBJECTIF ? 1 : 0;
//										a.IDENTIFIANT.OBJECTIF > b.IDENTIFIANT.OBJECTIF ? 1 :
//											a.PARTENAIRE.USAGER.VALUE < b.PARTENAIRE.USAGER.VALUE ? -1 : 
//												a.PARTENAIRE.USAGER.VALUE > b.PARTENAIRE.USAGER.VALUE ? 1 : 0;
					            });
								$scope.surfaces =  surfaces;
								$log.debug(">>>> $scope.surfaces nb = " + $scope.surfaces.length);
								$scope.surfacesLoaded = true;
							},
							function(response) {
								var message = "Le chargement des SURFACEs a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});								

			            
						/**
				         * Modal panel to update an elfin reference with the selection from a list of surfaces.
				         */
				        $scope.hbChooseSurface = function () {
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/hbChooseSurfaceModalDialog.html',
				                scope: $scope,
				                controller: 'HbChooseSurfaceModalController',
				                resolve: {
				                	elfins: function () {
				                    	return $scope.surfaces;
				                    },
				                    columnsDefinition: function() {
				                    	return [ { field:"IDENTIFIANT.OBJECTIF", displayName: "No objet"}, { field:"PARTENAIRE.USAGER.VALUE", displayName: "Locataire"} ];
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
				            		selectedSurfaceUpdate(selectedElfin);
					        		surfaceModelsUpdate(selectedElfin);

					        		// Manually trigger angular field and form states (valid, pristine,...)
					            	$scope.elfinForm[$scope.surfaceIdName].$setViewValue($scope.elfinForm[$scope.surfaceIdName].$viewValue)
				            	} else {
				            		//$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                //$log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };
				        
				        
				        /**
				         * Update bound surfaceElfinModel
				         */
				        var surfaceModelsUpdate = function(elfinSurface) {
			            	$scope.surfaceElfinModel = elfinSurface;
			            	// Let the scope know the surface model update has completed
			            	$scope.modelInitialised = true;
				        };				        
				        
				        /**
				         * Update scope selected surface and display string
				         */
				        var selectedSurfaceUpdate = function(selectedSurface) {
				        	// Update selected surface instance in scope
				        	$scope.selected.surface = selectedSurface;
				        	// Update selected surface display string
				        	if (selectedSurface !== null && angular.isDefined($scope.selected.surface) ) {
				        		$scope.selected.surfaceDisplay = $scope.selected.surface.IDENTIFIANT.OBJECTIF + " - " + $scope.selected.surface.PARTENAIRE.USAGER.VALUE;
				        	} else {
				        		$scope.selected.surfaceDisplay = " - "
				        	}
				        };
				        
				        /**
				         * Synchronise selected.surface to external surfaceElfinModel changes.
				         */
				        $scope.$watch('surfaceElfinModel', function(to, from) {
				        	selectedSurfaceUpdate(to); 
				        }, true);
				        
					} ]); // End of HbChooseSurfaceController definition
	


	/**
	 * HbChooseSurfaceModalController definition
	 */
	angular
		.module('hb5')
		.controller(
				'HbChooseSurfaceModalController',
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
							
							$log.debug("HbChooseSurfaceModalController >>>> hello ");
							
							// ============================================================
							// Custom search field used to filter elfins
							// ============================================================    	
							// Default ng-grid showFilter box requires an extra click 
							// to be accessed and is ugly. Let's define our own 
							
							$scope.search = { text: ""};
							
							$scope.$watch('search.text', function() {
								// TODO: CHANGE FILTER...
								$scope.elfins = $filter('uniteLocativeListAnyFilter')(elfins, $scope.search.text , false);
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
							
							
							var selectionConfirmed = function() {
								$modalInstance.close($scope.selectedElfins);
							};
							
							// ui-grid options. See ui-grid API Documentation for details.
							$scope.gridOptions = {
							        data: 'elfins',
							        columnDefs: columnsDefinition,
							        multiSelect: false,	
							        enableFullRowSelection: true,
							        modifierKeysToMultiSelect: false,					        
								    onRegisterApi: function (gridApi) {
								        //set gridApi on scope
								        $scope.gridApi = gridApi;
								        gridApi.selection.on.rowSelectionChanged($scope,function(row){
								          $scope.selectedElfins = gridApi.selection.getSelectedRows();
								        });
								    }								    
							    };    	
							
							$scope.ok = function () {
								selectionConfirmed();
							};
							$scope.cancel = function () {
							    $modalInstance.dismiss('cancel');
							};
							
							var focusOnSearchField = function() {
								$('#searchTextInput').focus();	
							};        
							
							// TODO: FocusTimeout issue. Find a better solution ? 
							$timeout(focusOnSearchField, 250, false);

						}]);	// End of HbChooseSurfaceModalController definition
        
})();
