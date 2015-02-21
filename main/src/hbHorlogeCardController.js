(function() {

	angular.module('hb5').controller(
			'HbHorlogeCardController',
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

						//$log.debug("    >>>> Using HbHorlogeCardController ");
						
				    	// Check when elfin instance becomes available 
				    	$scope.$watch('elfin.Id', function() { 
				    		
				    		if ($scope.elfin!=null) {						
						
					            // Make IMMEUBLE photo available
					            $scope.updatePhotoSrc();
			            
				    		};
				    		
				    	}, true);						
						
						
					} ]);
	

})();