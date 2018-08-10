(function() {

	angular.module('hb5').controller(
			'HbFontaineCardController',
			[
					'$scope',
					'GeoxmlService',
					'$uibModal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $uibModal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						//$log.debug("    >>>> Using HbFontaineCardController ");
						
				    	// Check when elfin instance becomes available 
				    	$scope.$watch('elfin.Id', function() { 
				    		
				    		if ($scope.elfin!=null) {						
						
					            // Make IMMEUBLE photo available
					            $scope.updatePhotoSrc();
			            
				    		};
				    		
				    	}, true);						
						
						
					} ]);
	

})();