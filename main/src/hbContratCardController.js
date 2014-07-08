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
							function($scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil) {

								$log
										.debug("    >>>> Using HbContratCardController");

								var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
								// TODO: actorsCollectionId must come from
								// server configuration resource.
								$log
										.debug("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
								var actorsCollectionId = 'G20060401225530100';

								$scope.entrepriseActors = null;

								GeoxmlService
										.getCollection(actorsCollectionId)
										.getList({
											"xpath" : xpathForEntreprises
										})
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
