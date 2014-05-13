(function() {

	angular.module('hb5').controller(
			'ConstatCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, hbAlertMessages, hbUtil) {

						console.log("    >>>> Using ConstatCardController");

						// TODO: get this dynamically from HB5 catalogue
						$scope.statusTypes = {
							Vu : "Vu",
							SUIVRE : "SUIVRE"
						};

					} ]);

})();