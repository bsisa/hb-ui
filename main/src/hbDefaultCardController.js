(function() {

	angular.module('hb5').controller(
			'HbDefaultCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						//$log.debug("    >>>> Using HbDefaultCardController ");
						
						// we do not expect to have much logic here which shall not 
						// go to hbCardContainerController. 
						
						
				    	// Check when elfin instance becomes available 
				    	$scope.$watch('elfin.Id', function() { 
				    		
				    		if ($scope.elfin!=null) {						
						
					            // Make IMMEUBLE photo available
					            $scope.updatePhotoSrc();
			            
				    		};
				    		
				    	}, true);
						
						
					} ]);
	

})();