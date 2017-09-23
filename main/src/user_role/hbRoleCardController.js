(function() {

	angular.module('hb5').controller(
			'HbRoleCardController',
			[
					'$scope',
					'$attrs',
					'GeoxmlService',
					'$modal',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					'hbQueryService',
					function($scope, $attrs, GeoxmlService, $modal, 
							$log, hbAlertMessages, hbUtil, hbQueryService) {

						//$log.debug("    >>>> Using HbRoleCardController ");

			            // Asychronous ROLE template preloading
			            GeoxmlService.getNewElfin("ROLE").get()
			            .then(function(role) {
			            		// Get list from catalogue default
			            		$scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(role.GROUPE);
							},
							function(response) {
								var message = "Les valeurs par défaut pour la CLASSE ROLE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
								hbAlertMessages.addAlert("danger",message);
							});								

			            // Asychronous existing ROLEs preloading
			            var xpathForRoles = "//ELFIN[@CLASSE='ROLE']";
			            hbQueryService.getRoleList(xpathForRoles)
						.then(function(roles) {
								$scope.roles = roles;
							},
							function(response) {
								var message = "Le chargement des ROLEs a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});			            
						
						
						// Proceed with operations which require elfin to be loaded 
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {
								if ( $attrs.hbMode === "create" ) {
									// Reset default from catalogue
									$scope.elfin.GROUPE = "";									
								} else {
									// Do nothing
								}					            
				    		};	
				    	}, true);						
						
						
						
					} ]);
	

})();