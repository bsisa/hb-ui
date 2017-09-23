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

						//$log.debug("    >>>> Using HbActorLineConverterController");						
						
						$scope.actorModel = { 
								Id : "",
								ID_G : "", 
								GROUPE : "", 
								NOM : ""
								}; 
						
			        	/**
			        	 * Listen to FRACTION.L modification (initialisation). actor.Id is stored at C[2].VALUE
			        	 * and set actorModel. 
			        	 */
						$scope.$watch('lineModel.C[2]', function (newValue, oldValue) {
							
							//$log.debug("lineModel.C[2] >>>> lineModel.C.length: " + $scope.lineModel.C.length);
							
							// C[@POS="1"] => C[0] is unused
							// C[@POS='2'] contains ID_G
			            	$scope.actorModel.ID_G = $scope.lineModel.C[1].VALUE;
							// C[@POS='3'] contains Id
			            	$scope.actorModel.Id = $scope.lineModel.C[2].VALUE;
							// C[@POS='4'] optionally contains GROUPE
			            	$scope.actorModel.GROUPE = $scope.lineModel.C.length > 3 ? $scope.lineModel.C[3].VALUE : "";
							// C[@POS='5'] optionally contains NOM
			            	$scope.actorModel.NOM = $scope.lineModel.C.length > 4 ? $scope.lineModel.C[4].VALUE : "";
						}, true);						
						
						/**
						 * Listen to actorModel update to be reflected to lineModel
						 */
						$scope.$watch('actorModel', function (newValue, oldValue) {
							// C[@POS="1"] => C[0] is unused
							$scope.lineModel.C[1].VALUE = $scope.actorModel.ID_G;
							// C[@POS='2'] contains ID_G							
			            	$scope.lineModel.C[2].VALUE = $scope.actorModel.Id;
							// C[@POS='3'] contains Id
			            	// Deal with incomplete data.
			            	if ($scope.lineModel.C.length === 3) {
			            		$scope.lineModel.C.push({POS: 4, VALUE: $scope.actorModel.GROUPE});
			            		$scope.lineModel.C.push({POS: 5, VALUE: $scope.actorModel.NOM});
			            	} else if ($scope.lineModel.C.length === 4) {
				            	$scope.lineModel.C[3].VALUE = $scope.actorModel.GROUPE;
			            		$scope.lineModel.C.push({POS: 5, VALUE: $scope.actorModel.NOM});
			            	} else if ($scope.lineModel.C.length > 4) {
				            	$scope.lineModel.C[3].VALUE = $scope.actorModel.GROUPE;
				            	$scope.lineModel.C[4].VALUE = $scope.actorModel.NOM;				            		
			            	}
						}, true);
	
					} ]);
        
})();
