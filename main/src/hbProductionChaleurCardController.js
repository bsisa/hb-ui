(function() {

	angular.module('hb5').controller(
			'HbProductionChaleurCardController',
			[
			 		'$attrs',
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					function($attrs, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						//$log.debug("    >>>> Using HbProductionChaleurCardController ");
						
						// Get available roles dynamically from HB5 catalogue
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {

					            // Asychronous PRODUCTION_CHALEUR template preloading
					            GeoxmlService.getNewElfin("PRODUCTION_CHALEUR").get()
					            .then(function(prodChaleur) {
					            		// Get list from catalogue default
					            		//$scope.xxx = hbUtil.buildArrayFromCatalogueDefault(prodChaleur.IDENTIFIANT.QUALITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE PRODUCTION_CHALEUR n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});				    			
					            
								if ( $attrs.hbMode === "create" ) {
									// Reset default xxx from catalogue
								    //$scope.elfin.IDENTIFIANT.QUALITE = "";
								} else {
									// Do nothing
								}					            
				    		};
				    		
				    	}, true);						
						
						
						
					} ]);
	

})();