(function() {

	angular
			.module('hb5')
			.controller(
					'HbContratCardController',
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
							'hbQueryService',
							function($scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, hbQueryService) {

								$log
										.debug("    >>>> Using HbContratCardController");

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

							} ]);

})();
