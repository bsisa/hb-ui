(function() {

	angular.module('hb5').controller(
			'HbActorLineConverterController',
			[
					'$scope',
					'$log',
					'$filter',
					'hbUtil',
					'GeoxmlService',
					function($scope, $log, $filter, hbUtil, GeoxmlService) {

						$log.debug("    >>>> Using HbActorLineConverterController");						
						
						$scope.actorModel = { 
								Id : "",
								ID_G : "", 
								GROUPE : "", 
								NOM : "",
								IDENTIFIANT : { 
									QUALITE : ""
									}
								}; 
						
						/**
						 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
						 */
				        $scope.getElfinActor = function (collectionId, elfinId) {
				        	
					        GeoxmlService.getElfin(collectionId, elfinId).get()
					        .then(function(actorElfin) {
					        	// Force CAR array sorting by POS attribute
					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
					        	//       Need review of other similar operations
					        	if ( actorElfin['CARACTERISTIQUE'] != null && actorElfin['CARACTERISTIQUE']['CARSET'] != null && actorElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
					        		hbUtil.reorderArrayByPOS(actorElfin['CARACTERISTIQUE']['CARSET']['CAR']);
					        	}
					        	$scope.actorModel.IDENTIFIANT.QUALITE = actorElfin.IDENTIFIANT.QUALITE; 
					        }, function(response) {
					        	var message = "Aucun object ACTEUR disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
					        	$log.warn("HbChooseActorController - statut de retour: " + response.status + ". Message utilisateur: " + message);
					        });
			        		
			        	};							

			        	/**
			        	 * Listen to FRACTION.L modification (initialisation). actor.Id is stored at C[2].VALUE
			        	 * and set actorModel. 
			        	 */
						$scope.$watch('lineModel.C[2]', function (newValue, oldValue) {
			            	$scope.actorModel.ID_G = $scope.lineModel.C[1].VALUE;
			            	$scope.actorModel.Id = $scope.lineModel.C[2].VALUE;
			            	$scope.actorModel.GROUPE = $scope.lineModel.C.length > 3 ? $scope.lineModel.C[3].VALUE : "";
			            	$scope.actorModel.NAME = $scope.lineModel.C.length > 4 ? $scope.lineModel.C[4].VALUE : "";
			            	// Add ACTEUR properties not part of PERSONNEType such as IDENTIFIANT.QUALITE (actor role).
			            	$scope.getElfinActor($scope.actorModel.ID_G,$scope.actorModel.Id);
						}, true);						
						
						/**
						 * Listen to actorModel update to be reflected to lineModel
						 */
						$scope.$watch('actorModel', function (newValue, oldValue) {
							$scope.lineModel.C[1].VALUE = $scope.actorModel.ID_G;
			            	$scope.lineModel.C[2].VALUE = $scope.actorModel.Id;
			            	// Deal with incomplete data.
			            	if ($scope.lineModel.C.length === 3) {
			            		$scope.lineModel.C.push({POS: 4, VALUE: $scope.actorModel.GROUPE});
			            		$scope.lineModel.C.push({POS: 5, VALUE: $scope.actorModel.NAME});
			            	} else {
				            	$scope.lineModel.C[3].VALUE = $scope.actorModel.GROUPE;
				            	$scope.lineModel.C[4].VALUE = $scope.actorModel.NAME;			            		
			            	}
			            	// Add ACTEUR properties not part of PERSONNEType such as IDENTIFIANT.QUALITE (actor role).
			            	$scope.getElfinActor($scope.actorModel.ID_G,$scope.actorModel.Id);
						}, true);
	
					} ]);
        
})();
