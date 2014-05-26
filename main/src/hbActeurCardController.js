(function() {

	angular.module('hb5').controller(
			'HbActeurCardController',
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

						$log.debug("    >>>> Using HbActeurCardController ");
						
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