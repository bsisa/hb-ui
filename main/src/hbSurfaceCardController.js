(function() {

	angular.module('hb5').controller(
					'HbSurfaceCardController',
					[
							'$scope',
							'$attrs',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							function($scope, $attrs, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil) {

								$log.debug("    >>>> Using HbSurfaceCardController");

						    	// Check when elfin instance becomes available 
						    	$scope.$watch('elfin.Id', function() { 
						    		
						    		if ($scope.elfin!=null) {
						    			/**
						    			 * Perform template clean up tasks while in create mode.
						    			 */
							    		if ($attrs.hbMode === "create") {
							    			$scope.elfin.GROUPE = "";
							    		} 
						    		};
						    		
						    	}, true);								
								
						    	GeoxmlService.getNewElfin("SURFACE").get()
					            .then(function(unite_locative) {
					            		// Get groupeChoices from catalogue default
					            	    $scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(unite_locative.GROUPE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE UNITE_LOCATIVE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});								
								
							} ]);

})();
