(function() {

	angular.module('hb5').controller(
			'ActeurCardController',
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

						console.log("    >>>> Using ActeurCardController");

						// TODO: get this dynamically from HB5 catalogue
						$scope.qualiteList = {
							"Gérant" : "Gérant",
							"Concierge" : "Concierge",
							"Responsable chauffage" : "Responsable chauffage",
							"Entreprise" : "Entreprise",
							"Collaborateur" : "Collaborateur"
						};

					} ]);

})();