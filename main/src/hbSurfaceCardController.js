(function() {

	angular.module('hb5').controller(
					'HbSurfaceCardController',
					[
							'$scope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							function($scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil) {

								$log.debug("    >>>> Using HbSurfaceCardController");

							} ]);

})();
