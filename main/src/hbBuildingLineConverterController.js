(function() {

	angular.module('hb5').controller(
			'HbBuildingLineConverterController',
			[
					'$scope',
					'$log',
					'$filter',
					'hbUtil',
					'GeoxmlService',
					function($scope, $log, $filter, hbUtil, GeoxmlService) {

			        	/**
			        	 * Listen to FRACTION.L modification (initialisation). building.Id is stored at C[2].VALUE
			        	 * and set buildingElfin. 
			        	 */
						$scope.$watch('lineModel', function (newValue, oldValue) {
						
							if (!angular.isUndefined($scope.lineModel) ) {
								if (!angular.isUndefined($scope.lineModel.C)) {
								
					            	var classe = hbUtil.getCByPos($scope.lineModel.C, 1).VALUE
					            	var collectionId = hbUtil.getCByPos($scope.lineModel.C, 2).VALUE // $scope.lineModel.C[1].VALUE;
					            	var elfinId =  hbUtil.getCByPos($scope.lineModel.C, 3).VALUE // $scope.lineModel.C[2].VALUE;
					            	
									// Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
							        GeoxmlService.getElfin(collectionId, elfinId).get()
							        .then(function(buildingElfin) {
							        	// Force CAR array sorting by POS attribute
							        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
							        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
							        	//       Need review of other similar operations
							        	if ( buildingElfin['CARACTERISTIQUE'] != null && buildingElfin['CARACTERISTIQUE']['CARSET'] != null && buildingElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
							        		hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
							        	}
							        	$scope.buildingElfin = buildingElfin;
							        	
							        }, function(response) {
							        	var message = "Aucun object "+classe+" disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
							        	$log.warn("HbBuildingLineConverterController - statut de retour: " + response.status + ". Message utilisateur: " + message);
							            hbAlertMessages.addAlert("danger",message);
							            
							        });
								}
							}

						}, true);
	
					} ]);
        
})();
