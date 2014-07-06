(function() {

	angular
			.module('hb5')
			.controller(
					'HbTransactionCardController',
					[
							'$attrs',
							'$scope',
							'$rootScope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							'HB_EVENTS',
							'userDetails',
							function($attrs, $scope, $rootScope, GeoxmlService,
									$modal, $routeParams, $location, $log,
									$timeout, hbAlertMessages, hbUtil,
									HB_EVENTS, userDetails) {

								$log.debug("    >>>> Using HbTransactionCardController");

								// Benefit from server side cache...
								var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";
								// TODO: immeublesCollectionId must come from
								// server configuration resource.
								$log.debug("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
								var immeublesCollectionId = 'G20040930101030005';

								// Asychronous buildings preloading
								GeoxmlService
										.getCollection(immeublesCollectionId)
										.getList({
											"xpath" : xpathForImmeubles
										})
										.then(
												function(immeubles) {
													$scope.immeubles = immeubles;
													$log
															.debug(">>> IMMEUBLES: "
																	+ immeubles.length);
												},
												function(response) {
													var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "
															+ response.status
															+ ")";
													hbAlertMessages.addAlert(
															"danger", message);
												});

								$scope.displayBuildingAddress = function(noSai) {
									if ((!$scope.selectedImmeuble)
											|| ($scope.selectedImmeuble && $scope.selectedImmeuble.IDENTIFIANT.OBJECTIF != noSai)) {
										if ($scope.immeubles
												&& $scope.immeubles.length > 0) {
											for (var i = 0; i < $scope.immeubles.length; i++) {
												var currImm = $scope.immeubles[i];
												if (currImm.IDENTIFIANT.OBJECTIF == noSai) {
													$scope.selectedImmeuble = currImm;
													break;
												}
											}
										}
									} else {
										// $log.debug(" >>>> objectif BLUR No
										// new SAI");
									}

								};
								
								// Copy VALEUR_A_NEUF to VALEUR only if VALEUR is 0 
								$scope.copyValeur_a_Neuf2Valeur = function(valneuf) {
									// Only initialise to valneuf if no set (== 0)
									if ($scope.elfin.IDENTIFIANT.VALEUR == 0) {
										$scope.elfin.IDENTIFIANT.VALEUR = valneuf;
									} 
								};

								$rootScope
										.$on(
												HB_EVENTS.ELFIN_CREATED,
												function(event, elfin) {

													// Update elfin properties from catalogue while in create mode
													if ($attrs.hbMode === "create") {

														if ($scope.elfin) {

															var currentDate = new Date();
															$scope.elfin.IDENTIFIANT.DE = hbUtil
																	.getDateInHbTextFormat(currentDate);
															$scope.elfin.IDENTIFIANT.PAR = currentDate
																	.getFullYear()
																	.toString();

															// Reset default value from catalogue is not relevant
															$scope.elfin.IDENTIFIANT.QUALITE = "";
															// Get user abbreviation from userDetails service
															$scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation();
															// Default value from catalogue contains constatTypes list: Reset it.
															$scope.elfin.GROUPE = "";
														} else {
															$log
																	.error("elfin should be available after HB_EVENTS.ELFIN_CREATED event notification.");
														}
													} else {
														// Do nothing
													}
												});

								// Asychronous TRANSACTION template preloading
								GeoxmlService.getNewElfin("TRANSACTION").get().then(
									function(transaction) {
										// Get transaction types
										// from catalogue
										$scope.transactionTypes = hbUtil.buildArrayFromCatalogueDefault(transaction.GROUPE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE TRANSACTION n'ont pas pu être chargées. (statut de retour: "
												+ response.status
												+ ")";
										hbAlertMessages.addAlert(
												"danger", message);
									});
								
								// Asychronous PRESTATION template preloading
								GeoxmlService.getNewElfin("PRESTATION").get().then(
									function(prestation) {
										 //Get prestation types from catalogue
										 $scope.prestationTypes = hbUtil.buildArrayFromCatalogueDefault(prestation.GROUPE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE PRESTATION n'ont pas pu être chargées. (statut de retour: "
												+ response.status
												+ ")";
										hbAlertMessages.addAlert(
												"danger", message);
									});

								var focusOnField = function() {
									$('#objectif').focus();
								};

								$scope.immeubleChooseOneColumnsDefinition = [
										{
											field : "PARTENAIRE.PROPRIETAIRE.VALUE",
											displayName : "Propriétaire"
										},
										{
											field : "IDENTIFIANT.OBJECTIF",
											displayName : "Numéro de gérance"
										},
										{
											field : "CARACTERISTIQUE.CARSET.CAR[0].VALEUR",
											displayName : "Lieu-dit"
										} ];
								$scope.immeubleChooseOneTemplate = '/assets/views/chooseOneImmeuble.html';

								// TODO: FocusTimeout issue. Find a better
								// solution ?
								$timeout(focusOnField, 500, true);

								
								var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
					            // TODO: actorsCollectionId must come from server configuration resource.
					            $log.debug("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
					            var actorsCollectionId = 'G20060401225530100';								
								
								/* ajout PYS 20140706 ca ne marche pas */
								$scope.entrepriseActors = null;

								GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForEntreprises}).then(
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
