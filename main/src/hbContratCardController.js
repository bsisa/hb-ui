(function() {

	angular
			.module('hb5')
			.controller(
					'HbContratCardController',
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
							'hbQueryService',
							function($scope, $attrs, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, hbQueryService) {

								//$log.debug("    >>>> Using HbContratCardController");

								
						    	// Check when elfin instance becomes available 
						    	$scope.$watch('elfin.Id', function() { 
						    		
						    		if ($scope.elfin!=null) {
						    			/**
						    			 * Perform template clean up tasks while in create mode.
						    			 */
							    		if ($attrs.hbMode === "create") {
							    			if ($routeParams.sai) {
							    				$scope.elfin.IDENTIFIANT.OBJECTIF = $routeParams.sai;
							    				// Reset choices list init. values.
							    				$scope.elfin.CARACTERISTIQUE.CAR1.UNITE = '';
							    				$scope.elfin.CARACTERISTIQUE.CAR1.VALEUR = '';
							    			}
							    			$scope.elfin.GROUPE = "";
							    		}
							    		
						    		};
						    		
						    	}, true);								
								
						    	GeoxmlService.getNewElfin("CONTRAT").get()
					            .then(function(contrat) {
					            		// Get groupeChoices from catalogue default
					            	    $scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(contrat.GROUPE);
					            	    $scope.prestation_IChoices = hbUtil.buildArrayFromCatalogueDefault(contrat.CARACTERISTIQUE.CAR1.UNITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE CONTRAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});								
								
								
								var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
								$scope.entrepriseActors = null;
								hbQueryService.getActors(xpathForEntreprises)
										.then(
												function(entrepriseActors) {
													$scope.entrepriseActors = entrepriseActors;
												},
												function(response) {
													var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "
															+ response.status
															+ ")";
													hbAlertMessages.addAlert(
															"danger", message);
												});
								

					            // Parameters to hbChooseOne service function for ACTOR selection
					            $scope.actorChooseOneColumnsDefinition = [
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];
					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';								

							} ]);

})();
