(function() {

	angular.module('hb5').controller(
			'HbRoleCardController',
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

						$log.debug("    >>>> Using HbRoleCardController ");
						
						
					} ]);
	

})();