(function() {

	
	/**
	 * HbTypeaheadCodeController definition.
	 * 
	 */
	angular.module('hb5').controller(
			'HbTypeaheadCodeController',
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
						} else { // By default the hb-typeahead-code widget let the user modify the bound codeModel
							$scope.cannotEdit = false;
						}

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

						
						$scope.checkCodeType = function() {
							$log.debug("checkCodeType... " );
			        		if ($scope.selected.code !== null) {
			        			if ( (typeof $scope.selected.code) === 'string' )  {
			        				$log.debug("newCode is a string  = " + $scope.selected.code);
			        			} else if ( (typeof $scope.selected.code) === 'object' ) {
			        				$log.debug("newCode is an object = " + angular.toJson($scope.selected.code) );
			        			} else {
			        				$log.debug("newCode is of unexpected type of = " + (typeof $scope.selected.code) );
			        			}
			        		} else {
			        			$log.debug("$scope.selected.code is no defined...");
			        		}							
							
						};
						
			        	/**
			        	 * selected.code listener
			        	 */
			        	var selectedCodeWatchDeregistration = $scope.$watch('selected.code', function(newCode, oldCode) {

	        				$log.debug(">>>>>>>>>>>> HbTypeaheadCodeController - 'selected.code' LISTENER: oldCode = " + oldCode + " => newCode = " + newCode);			        		
			        		
//			        		if ($scope.selected.code !== null) {
//			        			if ( (typeof newCode) === 'string' )  {
//			        				$log.debug("newCode is a string  = " + newCode);
//			        			} else if ( (typeof newCode) === 'object' ) {
//			        				$log.debug("newCode is an object = " + angular.toJson(newCode) );
//			        			} else {
//			        				$log.debug("newCode is of unexpected type of = " + (typeof newCode) );
//			        			}
//			        		} else {
//			        			$log.debug("$scope.selected.code is no defined...");
//			        		}
			        		
			        		
			        		if (!angular.isUndefined($scope.selected.code) && newCode !== oldCode) {
			        			$log.debug(" code defined and has changed...");
					        	//selectedCodeUpdate($scope.codeElfinModel);
					        	//codeModelsUpdate($scope.codeElfinModel);
			            		// Force validation in create mode as well
			            		//$scope.enableValidateCode();
			        			// Remove listener now that we tried loading the code elfin object.
			            		//codeElfinModelWatchDeregistration();			            		
			        		}

			            });
						
//						/**
//						 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
//						 */
//				        $scope.getElfinCode = function (collectionId, elfinId) {
//				        	
//					        GeoxmlService.getElfin(collectionId, elfinId).get()
//					        .then(function(codeElfin) {
//					        	// Force CAR array sorting by POS attribute
//					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
//					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
//					        	//       Need review of other similar operations
//					        	if ( codeElfin['CARACTERISTIQUE'] != null && codeElfin['CARACTERISTIQUE']['CARSET'] != null && codeElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
//					        		hbUtil.reorderArrayByPOS(codeElfin['CARACTERISTIQUE']['CARSET']['CAR']);
//					        	}
//					        	selectedCodeUpdate(codeElfin);
//					        	codeModelsUpdate(codeElfin);
//
//					        	$scope.enableValidateCode();
//					        }, function(response) {
//					        	var message = "Aucun object IMMEUBLE disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
//					        	$log.warn("HbTypeaheadCodeController - statut de retour: " + response.status + ". Message utilisateur: " + message);
//					            hbAlertMessages.addAlert("danger",message);
//					            $scope.enableValidateCode();
//					        });
//			        		
//			        	};							

//			        	/**
//			        	 * codeElfinModel references an ELFIN of CLASSE IMMEUBLE
//			        	 * This listener is used only for code initialisation from model binding.
//			        	 */
//			        	var codeElfinModelWatchDeregistration = $scope.$watch('codeElfinModel.Id', function(newId, oldId) {
//			        		
//			        		$log.debug(">>>>>>>>>>>> HbTypeaheadCodeController - 'codeElfinModel.Id' LISTENER: oldId = " + oldId + " => newId = " + newId);
//			        		
//			        		if (!angular.isUndefined($scope.codeElfinModel) && newId !== oldId) {
//					        	selectedCodeUpdate($scope.codeElfinModel);
//					        	codeModelsUpdate($scope.codeElfinModel);
//			            		// Force validation in create mode as well
//			            		$scope.enableValidateCode();
//			        			// Remove listener now that we tried loading the code elfin object.
//			            		codeElfinModelWatchDeregistration();			            		
//			        		}
//
//			            });			        	

			        	
						// Select and sort all CODE where GROUPE = 'CFC'
						var xpathForCfcCodes = "//ELFIN[@CLASSE='CODE' and @GROUPE='CFC']";
						// Asychronous codes preloading
						hbQueryService.getCodes(xpathForCfcCodes).then(
							function(cfcCodes) {
								$scope.codes = _.sortBy(cfcCodes, function(cfcCode){ return cfcCode.CARACTERISTIQUE.CAR1.VALEUR });
								$log.debug(">>> CODES.CFC: " + cfcCodes.length);
							},
							function(response) {
								var message = "Le chargement de la liste de CODE CFC a échoué (statut de retour: " + response.status + ")";
								hbAlertMessages.addAlert("danger", message);
							}
						);				        	
				        
//				        
//				        /**
//				         * Update bound codeElfinModel
//				         */
//				        var codeModelsUpdate = function(elfinCode) {
//			            	$scope.codeElfinModel = elfinCode;
//			            	// Let the scope know the code model update has completed
//			            	$scope.modelInitialised = true;
//				        };				        
//				        
//				        /**
//				         * Update scope selected code and display string
//				         */
//				        var selectedCodeUpdate = function(selectedCode) {
//				        	// Update selected code instance in scope
//				        	$scope.selected.code = selectedCode;
//				        	// Update selected code display string
//				        	$scope.selected.codeDisplay = $scope.selected.code.IDENTIFIANT.NOM + " - " + $scope.selected.code.DIVERS.REMARQUE;
//				        };

					} ]); // End of HbTypeaheadCodeController definition
	

        
})();
