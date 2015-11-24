(function() {

	
	/**
	 * HbChooseCodeController definition.
	 * 
	 */
	angular.module('hb5').controller(
			'HbChooseCodeController',
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
						$scope.codesLoaded = false;
				
						// Check if optional editable property is available
						if ($scope.editable) {
							// We need to deal with text values, make it explicit rather than use == operator.
							if (($scope.editable === 'true') || ($scope.editable === true)) {
								$scope.cannotEdit = false;
							} else {
								$scope.cannotEdit = true;
							}
						} else { // By default the hb-choose-code widget let the user modify the bound codeModel
							$scope.cannotEdit = false;
						}

						$scope.selectionEnabled = function() {
							return (!$scope.cannotEdit && $scope.codesLoaded);
						};
						
						/**
						 * Initialisation state information
						 */
						$scope.modelInitialised = false;
						
						/**
						 *  Wait for the code to have a chance to load before displaying validation error.
						 */
						$scope.validateCode = false;
						
						/**
						 * Code linked to the current directive.
						 */
						$scope.selected = { "code" : null , "codeDisplay" : null };						
						
						/**
						 * Enables code validation with a delay.
						 */
						$scope.enableValidateCode = function() {
							$timeout(function(){
								$scope.validateCode = true;
							}, 2000, true);
						};						
						
						/**
						 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
						 */
				        $scope.getElfinCode = function (collectionId, elfinId) {
				        	
					        GeoxmlService.getElfin(collectionId, elfinId).get()
					        .then(function(codeElfin) {
					        	// Force CAR array sorting by POS attribute
					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
					        	//       Need review of other similar operations
					        	if ( codeElfin['CARACTERISTIQUE'] != null && codeElfin['CARACTERISTIQUE']['CARSET'] != null && codeElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
					        		hbUtil.reorderArrayByPOS(codeElfin['CARACTERISTIQUE']['CARSET']['CAR']);
					        	}
					        	selectedCodeUpdate(codeElfin);
					        	codeModelsUpdate(codeElfin);

					        	$scope.enableValidateCode();
					        }, function(response) {
					        	var message = "Aucun object IMMEUBLE disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
					        	$log.warn("HbChooseCodeController - statut de retour: " + response.status + ". Message utilisateur: " + message);
					            hbAlertMessages.addAlert("danger",message);
					            $scope.enableValidateCode();
					        });
			        		
			        	};							

			        	/**
			        	 * codeElfinModel references an ELFIN of CLASSE IMMEUBLE
			        	 * This listener is used only for code initialisation from model binding.
			        	 */
			        	var codeElfinModelWatchDeregistration = $scope.$watch('codeElfinModel.Id', function(newId, oldId) {
			        		
			        		if (!angular.isUndefined($scope.codeElfinModel) && newId !== oldId) {
					        	selectedCodeUpdate($scope.codeElfinModel);
					        	codeModelsUpdate($scope.codeElfinModel);
			            		// Force validation in create mode as well
			            		$scope.enableValidateCode();
			        			// Remove listener now that we tried loading the code elfin object.
			            		codeElfinModelWatchDeregistration();			            		
			        		}

			            });			        	

			        	
						// Select and sort all CODE where GROUPE = 'CFC'
						var xpathForCfcCodes = "//ELFIN[@CLASSE='CODE' and @GROUPE='CFC']";
						// Asychronous codes preloading
						hbQueryService.getCodes(xpathForCfcCodes).then(
							function(cfcCodes) {
								$scope.codes = _.sortBy(cfcCodes, function(cfcCode){ return cfcCode.IDENTIFIANT.NOM });
								$scope.codesLoaded = true;
							},
							function(response) {
								var message = "Le chargement de la liste de CODE CFC a échoué (statut de retour: " + response.status + ")";
								hbAlertMessages.addAlert("danger", message);
							}
						);				        	
			        	
			            
						/**
				         * Modal panel to update an elfin reference with the selection from a list of codes.
				         */
				        $scope.hbChooseCode = function () {
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/hbChooseCodeModalDialog.html',
				                scope: $scope,
				                controller: 'HbChooseCodeModalController',
				                resolve: {
				                	elfins: function () {
				                    	return $scope.codes;
				                    },
				                    columnsDefinition: function() {
				                    	return [ { field:"IDENTIFIANT.NOM", displayName: "Code"}, { field:"DIVERS.REMARQUE", displayName: "Description"} ];
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
				            		selectedCodeUpdate(selectedElfin);
					        		codeModelsUpdate(selectedElfin);

					            	// Manually trigger angular field and form states (valid, pristine,...)
					            	$scope.elfinForm[$scope.codeIdName].$setViewValue($scope.elfinForm[$scope.codeIdName].$viewValue);
					            	
				            	} else {
				            		//$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                //$log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };
				        
				        
				        /**
				         * Update bound codeElfinModel
				         */
				        var codeModelsUpdate = function(elfinCode) {
			            	$scope.codeElfinModel = elfinCode;
			            	// Let the scope know the code model update has completed
			            	$scope.modelInitialised = true;
				        };				        
				        
				        /**
				         * Update scope selected code and display string
				         */
				        var selectedCodeUpdate = function(selectedCode) {
				        	// Update selected code instance in scope
				        	$scope.selected.code = selectedCode;
				        	// Update selected code display string
				        	$scope.selected.codeDisplay = $scope.selected.code.IDENTIFIANT.NOM + " - " + $scope.selected.code.DIVERS.REMARQUE;
				        };

					} ]); // End of HbChooseCodeController definition
	


	/**
	 * HbChooseCodeModalController definition
	 */
	angular
		.module('hb5')
		.controller(
				'HbChooseCodeModalController',
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
								$scope.elfins = $filter('codeListAnyFilter')(elfins, $scope.search.text , false);
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
							
							$scope.doubleClickListener = function(rowItem) {
								selectionConfirmed();
							};
							
							// ui-grid options. See ui-grid API Documentation for details.
							$scope.gridOptions = {
							        data: 'elfins',
							        columnDefs: columnsDefinition,
							        enableFullRowSelection: true,
							        modifierKeysToMultiSelect: false,
							        multiSelect: false,							        
								    onRegisterApi: function (gridApi) {
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

						}]);	// End of HbChooseCodeModalController definition
        
})();
