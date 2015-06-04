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

						$log.debug("    >>>> Using HbBuildingLineConverterController");						
						
						/**
						 * Will obtain a reference to corresponding ELFIN@CLASSE='IMMEUBLE'
						 */
						//$scope.buildingElfin = {}; 
						
			        	/**
			        	 * Listen to FRACTION.L modification (initialisation). building.Id is stored at C[2].VALUE
			        	 * and set buildingModel. 
			        	 */
						$scope.$watch('lineModel', function (newValue, oldValue) {

							//$log.debug("lineModel >>>> newValue : " + angular.toJson(newValue));

//							// C[@POS="1"] contains CLASSE
//							$scope.buildingModel.CLASSE = hbUtil.getCByPos(lineModel.C, 1).VALUE //	$scope.lineModel.C[0].VALUE; 
//							// C[@POS='2'] contains ID_G
//			            	$scope.buildingModel.ID_G = hbUtil.getCByPos(lineModel.C, 2).VALUE // $scope.lineModel.C[1].VALUE;
//							// C[@POS='3'] contains Id
//			            	$scope.buildingModel.Id = hbUtil.getCByPos(lineModel.C, 3).VALUE // $scope.lineModel.C[2].VALUE;
//							// C[@POS='4'] optionally contains GROUPE
//			            	$scope.buildingModel.GROUPE = hbUtil.getCByPos(lineModel.C, 4).VALUE // $scope.lineModel.C.length > 3 ? $scope.lineModel.C[3].VALUE : "";
//							// C[@POS='5'] optionally contains NOM
//			            	$scope.buildingModel.NOM = hbUtil.getCByPos(lineModel.C, 5).VALUE // $scope.lineModel.C.length > 4 ? $scope.lineModel.C[4].VALUE : "";
			            	

							
//					            	var classe = hbUtil.getCByPos(newValue.C, 1).VALUE
//					            	var collectionId = hbUtil.getCByPos(newValue.C, 2).VALUE // $scope.lineModel.C[1].VALUE;
//					            	var elfinId =  hbUtil.getCByPos(newValue.C, 3).VALUE // $scope.lineModel.C[2].VALUE;
					            	
									/**
									 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
									 */
							  //      $scope.getElfinActor = function (collectionId, elfinId) {
							        	
//								        GeoxmlService.getElfin(collectionId, elfinId).get()
//								        .then(function(buildingElfin) {
//								        	// Force CAR array sorting by POS attribute
//								        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
//								        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
//								        	//       Need review of other similar operations
//								        	if ( buildingElfin['CARACTERISTIQUE'] != null && buildingElfin['CARACTERISTIQUE']['CARSET'] != null && buildingElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
//								        		hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
//								        	}
//								        	$log.debug(">>>> loaded buildingElfin for collectionId = " + collectionId + ", elfinId = " + elfinId );
//								        	$scope.buildingElfin = buildingElfin;
//								        	
//								        }, function(response) {
//								        	var message = "Aucun object "+classe+" disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
//								        	$log.warn("HbBuildingLineConverterController - statut de retour: " + response.status + ". Message utilisateur: " + message);
//								            hbAlertMessages.addAlert("danger",message);
//								            
//								        });
						        		

							//}							
							
							
							
							if (!angular.isUndefined($scope.lineModel) ) {
								
								if (!angular.isUndefined($scope.lineModel.C)) {
								
					            	var classe = hbUtil.getCByPos($scope.lineModel.C, 1).VALUE
					            	var collectionId = hbUtil.getCByPos($scope.lineModel.C, 2).VALUE // $scope.lineModel.C[1].VALUE;
					            	var elfinId =  hbUtil.getCByPos($scope.lineModel.C, 3).VALUE // $scope.lineModel.C[2].VALUE;
					            	
									/**
									 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
									 */
							        //$scope.getElfinActor = function (collectionId, elfinId) {
							        	
								        GeoxmlService.getElfin(collectionId, elfinId).get()
								        .then(function(buildingElfin) {
								        	// Force CAR array sorting by POS attribute
								        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
								        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
								        	//       Need review of other similar operations
								        	if ( buildingElfin['CARACTERISTIQUE'] != null && buildingElfin['CARACTERISTIQUE']['CARSET'] != null && buildingElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
								        		hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
								        	}
								        	$log.debug(">>>> loaded buildingElfin for collectionId = " + collectionId + ", elfinId = " + elfinId );
								        	$scope.buildingElfin = buildingElfin;
								        	
								        }, function(response) {
								        	var message = "Aucun object "+classe+" disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
								        	$log.warn("HbBuildingLineConverterController - statut de retour: " + response.status + ". Message utilisateur: " + message);
								            hbAlertMessages.addAlert("danger",message);
								            
								        });
						        		
						        	//};			            	
								}
							}
			            	
			            	
			            	
						}, true);
						
						/**
						 * Listen to buildingModel update to be reflected to lineModel
						 */
//						$scope.$watch('buildingModel', function (newValue, oldValue) {
//							// C[@POS="1"] => C[0] contains CLASSE
//							$scope.lineModel.C[1].VALUE = $scope.buildingModel.ID_G;
//							// C[@POS='2'] contains ID_G							
//			            	$scope.lineModel.C[2].VALUE = $scope.buildingModel.Id;
//							// C[@POS='3'] contains Id
//			            	// Deal with incomplete data.
//			            	if ($scope.lineModel.C.length === 3) {
//			            		$scope.lineModel.C.push({POS: 4, VALUE: $scope.buildingModel.GROUPE});
//			            		$scope.lineModel.C.push({POS: 5, VALUE: $scope.buildingModel.NOM});
//			            	} else if ($scope.lineModel.C.length === 4) {
//				            	$scope.lineModel.C[3].VALUE = $scope.buildingModel.GROUPE;
//			            		$scope.lineModel.C.push({POS: 5, VALUE: $scope.buildingModel.NOM});
//			            	} else if ($scope.lineModel.C.length > 4) {
//				            	$scope.lineModel.C[3].VALUE = $scope.buildingModel.GROUPE;
//				            	$scope.lineModel.C[4].VALUE = $scope.buildingModel.NOM;				            		
//			            	}
//						}, true);
						
				    	/**
				    	 * Helper to access to place information by POS instead of array index.
				    	 */
				    	$scope.getPlace = function(elfin) {
				    		var place = hbUtil.getCARByPos(elfin, 1);
				    		return (place === undefined) ? "" : place;
				    	};
	
					} ]);
        
})();
