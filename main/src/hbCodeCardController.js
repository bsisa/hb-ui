(function() {

	angular.module('hb5').controller(
			'HbCodeCardController',
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

						//$log.debug("    >>>> Using HbCodeCardController ");
						
						// Get available roles dynamically from HB5 catalogue
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {

					            // Asychronous ACTEUR template preloading
					            GeoxmlService.getNewElfin("CODE").get()
					            .then(function(code) {
					            		// Get code groups from catalogue default
					            		$scope.codeGroups = hbUtil.buildArrayFromCatalogueDefault(code.GROUPE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE CODE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});				    			
					            
								if ( $attrs.hbMode === "create" ) {
									// Remove default roles from catalogue
								    $scope.elfin.GROUPE = "";
								} else {
									// Do nothing
								}					            
				    		};
				    		
				    	}, true);						
						
						
						
					} ]);
	

})();