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
						
						// Get available roles dynamically from HB5 catalogue
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {

					            // Asychronous ACTEUR template preloading
					            GeoxmlService.getNewElfin("ACTEUR").get()
					            .then(function(actor) {
					            		// Get actor roles from catalogue default
					            		$scope.actorRoles = hbUtil.buildArrayFromCatalogueDefault(actor.IDENTIFIANT.QUALITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE ACTEUR n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});				    			
				    		};
				    		
				    	}, true);						
						
						
						
					} ]);
	

})();