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
								NOM : ""
								}; 
						
			        	/**
			        	 * Listen to FRACTION.L modification (initialisation). actor.Id is stored at C[2].VALUE
			        	 * and set actorModel. 
			        	 */
						$scope.$watch('lineModel.C[2]', function (newValue, oldValue) {
							// C[0] corresponding to POS="1" is unused.
			            	$scope.actorModel.ID_G = $scope.lineModel.C[1].VALUE;
			            	$scope.actorModel.Id = $scope.lineModel.C[2].VALUE;
			            	$scope.actorModel.GROUPE = $scope.lineModel.C.length > 2 ? $scope.lineModel.C[3].VALUE : "";
			            	$scope.actorModel.NAME = $scope.lineModel.C.length > 3 ? $scope.lineModel.C[4].VALUE : "";
						}, true);						
						
						/**
						 * Listen to actorModel update to be reflected to lineModel
						 */
						$scope.$watch('actorModel', function (newValue, oldValue) {
							// C[0] corresponding to POS="1" is unused.
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
						}, true);
	
					} ]);
        
})();
