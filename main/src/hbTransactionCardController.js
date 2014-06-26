(function() {

	angular.module('hb5').controller(
					'HbTransactionCardController',
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

								$log.debug("    >>>> Using HbTransactionCardController");

							} ]);

})();
