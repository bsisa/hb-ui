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
							'hbQueryService',
							function($attrs, $scope, $rootScope, GeoxmlService,
									$modal, $routeParams, $location, $log,
									$timeout, hbAlertMessages, hbUtil,
									HB_EVENTS, userDetails, hbQueryService) {

								$log.debug("    >>>> Using HbTransactionCardController");

								// ===================================================================================
								// Input fields used to select IMMEUBLE related to current TRANSACTION backing models
								// ===================================================================================								
								// Owner Actor (ACTEUR role=Propriétaire) 
								$scope.searchOwner = {Id : "", ID_G : "", GROUPE : "", NOM : ""};
								// No SAI user input field used to select IMMEUBLE related to current TRANSACTION
								$scope.constatSelectionHelperSai = '';
								// ===================================================================================								
								
								// Available repartition codes list loaded asynchronously from catalogue
								$scope.repartitions = null;
								
								// Benefit from server side cache...
								var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";
								// Asychronous buildings preloading
								hbQueryService.getImmeubles(xpathForImmeubles)
									.then(
											function(immeubles) {
												$scope.immeubles = immeubles;
												$log.debug(">>> IMMEUBLES: " + immeubles.length);
											},
											function(response) {
												var message = "Le chargement de la liste IMMEUBLE a échoué (statut de retour: "
														+ response.status
														+ ")";
												hbAlertMessages.addAlert("danger", message);
											}
										);

								/**
								 * Updates $scope.selectedImmeuble for IMMEUBLE matching both No SAI and owner Id
								 */
								$scope.displayBuildingAddress = function(noSai,owner) {
									if ( 	(!$scope.selectedImmeuble) ||
											( $scope.selectedImmeuble && $scope.selectedImmeuble.IDENTIFIANT.OBJECTIF != noSai) ||
											( $scope.selectedImmeuble && $scope.selectedImmeuble.PARTENAIRE.PROPRIETAIRE.Id != owner.Id) 
									) {
										if ($scope.immeubles
												&& $scope.immeubles.length > 0 && owner != null) {
											for (var i = 0; i < $scope.immeubles.length; i++) {
												var currImm = $scope.immeubles[i];
												if (currImm.IDENTIFIANT.OBJECTIF == noSai && owner.Id == currImm.PARTENAIRE.PROPRIETAIRE.Id && owner.ID_G == currImm.PARTENAIRE.PROPRIETAIRE.ID_G) {
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
								
								
								// Search prestation for no SAI, groupe prestation, year
								// TODO: Add owner parameter.
								$scope.getPrestation = function(sai,groupePrestation,year) {
									
									//elfin.IDENTIFIANT.OBJECTIF
									//elfin.CARACTERISTIQUE.CAR1.UNITE
									//elfin.IDENTIFIANT.PAR
									$log.debug("getPrestation = " + "sai = " + sai +", groupePrestation = " + groupePrestation + ", year = " + year);
									// TODO: move prestationCollectionId to constants.
									var prestationCollectionId = "G20081113902512302";
									var xpathForPrestation = "//ELFIN[@GROUPE='"+groupePrestation+"' and IDENTIFIANT/DE='"+year+"' and starts-with(IDENTIFIANT/OBJECTIF, '"+sai+".')]";
									
									// Asychronous buildings preloading
									GeoxmlService
											.getCollection(prestationCollectionId)
											.getList({
												"xpath" : xpathForPrestation
											})
											.then(
													function(prestations) {
														
														if (prestations.length == 1) {
															$scope.constatPrestation = prestations[0];
															$scope.elfin.IDENTIFIANT.COMPTE = $scope.constatPrestation.IDENTIFIANT.COMPTE;
															$scope.elfin.IDENTIFIANT.OBJECTIF = $scope.constatPrestation.IDENTIFIANT.OBJECTIF;
															$log.debug(">>> : $scope.constatPrestation = " + $scope.constatPrestation);
														} else if (prestations.length < 1) {
															$scope.constatPrestation = null;
															$scope.elfin.IDENTIFIANT.COMPTE = null;
															$scope.elfin.IDENTIFIANT.OBJECTIF = null;
															hbAlertMessages.addAlert(
																	"warning", "Pas de prestation correspondant aux informations: SAI = " + sai + ", groupe de prestation = " + groupePrestation + ", année = " + year);
														} else if (prestations.length > 1) {
															$scope.constatPrestation = null;
															$scope.elfin.IDENTIFIANT.COMPTE = null;
															$scope.elfin.IDENTIFIANT.OBJECTIF = null;															
															hbAlertMessages.addAlert(
																	"warning", "Plusieurs prestations correspondent aux informations: SAI = " + sai + ", groupe de prestation = " + groupePrestation + ", année = " + year);															
														}
													},
													function(response) {
														var message = "Le chargement de la PRESTATION correspondant aux informations: SAI = " + sai + ", groupe de prestation = " + groupePrestation + ", année = " + year + " a échoué (statut de retour: "
																+ response.status
																+ ")";
														hbAlertMessages.addAlert(
																"danger", message);
													});
									
								};								
								

					            /**
					             * Perform operations once we are guaranteed to have access to $scope.elfin instance.
					             */
						    	$scope.$watch('elfin.Id', function() { 

						    		if ($scope.elfin!=null) {

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
												// Default value from catalogue contains repartition list: Reset it.
												$scope.elfin.CARACTERISTIQUE.CAR3.VALEUR = "";
											} else {
												$log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
											}
										} else {
											// Do nothing
										}
						    		};
						    	}, true);								
								

								// Asychronous TRANSACTION template preloading
								GeoxmlService.getNewElfin("TRANSACTION").get().then(
									function(transaction) {
										// Get transaction types
										// from catalogue
										$scope.transactionTypes = hbUtil.buildArrayFromCatalogueDefault(transaction.GROUPE);
										$scope.repartitions = hbUtil.buildArrayFromCatalogueDefault(transaction.CARACTERISTIQUE.CAR3.VALEUR);
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
					            $log.debug("TODO: HbTransactionCardController: actorsCollectionId must come from server configuration resource.");
					            var actorsCollectionId = 'G20060401225530100';								
								
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
