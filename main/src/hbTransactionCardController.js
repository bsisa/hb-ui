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
								$scope.helper = { constatSelectionSai : ""};
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
												// Force selectedImmeuble update in case these were set before the current 
												// immeubles list was loaded. This is the case in create mode with $routeParams.sai
												$scope.displayBuildingAddress($scope.helper.constatSelectionSai,$scope.searchOwner);
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
									$log.debug("displayBuildingAddress = function("+noSai+","+owner.Id+")");
										if ($scope.immeubles
												&& $scope.immeubles.length > 0 && owner != null) {
											var foundSelection = false;
											for (var i = 0; i < $scope.immeubles.length; i++) {
												var currImm = $scope.immeubles[i];
												if (currImm.IDENTIFIANT.OBJECTIF == noSai && owner.Id == currImm.PARTENAIRE.PROPRIETAIRE.Id && owner.ID_G == currImm.PARTENAIRE.PROPRIETAIRE.ID_G) {
													$scope.selectedImmeuble = currImm;
													foundSelection = true;
													break;
												}
											}
											if (!foundSelection) {
												$scope.selectedImmeuble = null;
											}
										}
								};
								
								/**
						    	 * Refresh address found with helpers CONSTAT and ACTOR 'Propriétaire' information changes.
						    	 */
						    	$scope.$watch('[helper.constatSelectionSai,searchOwner.Id]', function() {
						    		$scope.displayBuildingAddress($scope.helper.constatSelectionSai,$scope.searchOwner);
						    	}, true);								
								
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
									
									if ( sai != null && sai.length > 0 && groupePrestation != null && groupePrestation.length > 0 && year != null && year.length === 4 ) {
									
										//elfin.IDENTIFIANT.OBJECTIF
										//elfin.CARACTERISTIQUE.CAR1.UNITE
										//elfin.IDENTIFIANT.PAR
										$log.debug("getPrestation = " + "sai = " + sai +", groupePrestation = " + groupePrestation + ", year = " + year);
										// TODO: move prestationCollectionId to constants.
										var prestationCollectionId = "G20081113902512302";
										var xpathForPrestation = "//ELFIN[@GROUPE='"+groupePrestation+"' and IDENTIFIANT/DE='"+year+"' and starts-with(IDENTIFIANT/OBJECTIF, '"+sai+".')]";
										
										// Asychronous PRESTATIONS preloading
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
									
									} else {
										$scope.constatPrestation = null;
										$scope.elfin.IDENTIFIANT.COMPTE = null;
										$scope.elfin.IDENTIFIANT.OBJECTIF = null;										
									}
									
								};				

								
								/**
								 * Updates PRESTATION.GROUPE on TRANSACTION.GROUPE update
								 */
						    	$scope.$watch('elfin.GROUPE', function() {
						    		if ($scope.elfin!=null ) {
						    			if ($scope.elfin.GROUPE!=null) {
							    			$log.debug(">>>> updating $scope.elfin.CARACTERISTIQUE.CAR1.UNITE = " + $scope.elfin.CARACTERISTIQUE.CAR1.UNITE + " to " + hbUtil.getPrestationGroupForTransactionGroup($scope.elfin.GROUPE));
							    			$scope.elfin.CARACTERISTIQUE.CAR1.UNITE = hbUtil.getPrestationGroupForTransactionGroup($scope.elfin.GROUPE);						    				
						    			} else {
							    			$scope.elfin.CARACTERISTIQUE.CAR1.UNITE = '';
							    		}
						    		}
						    	}, true);
								
								/**
								 * Listen to informations required to find out related PRESTATION
								 */
								$scope.$watch('[helper.constatSelectionSai,elfin.CARACTERISTIQUE.CAR1.UNITE,elfin.IDENTIFIANT.PAR]', function() {
									// Prevent unnecessary call to getPrestation
									//if ($scope.elfin!=null && $scope.elfin.IDENTIFIANT.PAR.length === 4 && $scope.helper.constatSelectionSai.length > 0 && $scope.elfin.CARACTERISTIQUE.CAR1.UNITE.length > 0) {
									if ($scope.elfin!=null) {
										$scope.getPrestation($scope.helper.constatSelectionSai,$scope.elfin.CARACTERISTIQUE.CAR1.UNITE,$scope.elfin.IDENTIFIANT.PAR);
									}
									//}
								}, true);

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
												
												// If a No SAI corresponding to an existing PRESTATION is provided
												// set it to elfin.IDENTIFIANT.OBJECTIF
												if ($routeParams.sai) {
													// Check the corresponding PRESTATION exists and if available, copy relevant information to 
													// current new TRANSACTION.
													var xpathForPrestationByObjectif = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$routeParams.sai+"']";
													hbQueryService.getPrestations(xpathForPrestationByObjectif).then(
														function(prestations) {
															if (prestations.length === 1) {
																var prestation = prestations[0];
																// Update OBJECTIF
																$scope.elfin.IDENTIFIANT.OBJECTIF = prestation.IDENTIFIANT.OBJECTIF;
																// Update helper fields
																$scope.searchOwner = {Id : prestation.PARTENAIRE.PROPRIETAIRE.Id, ID_G : prestation.PARTENAIRE.PROPRIETAIRE.ID_G, GROUPE : prestation.PARTENAIRE.PROPRIETAIRE.GROUPE, NOM : prestation.PARTENAIRE.PROPRIETAIRE.NOM};
																$scope.helper.constatSelectionSai = prestation.IDENTIFIANT.OBJECTIF.split('.')[0];
																// Groupe prestation
																$scope.elfin.CARACTERISTIQUE.CAR1.UNITE = prestation.GROUPE; 
																// Year prestation
																$scope.elfin.IDENTIFIANT.PAR = prestation.IDENTIFIANT.DE;
															} else if (prestations.length > 1 ) {
																var message = "Le numéro d'objectif: "+$routeParams.sai+" fourni correspond à plus d'une PRESTATION, cette information n'est pas prise en compte.";
																hbAlertMessages.addAlert(
																		"warning", message);
															} else if (prestations.length > 1 ) {
																var message = "Le numéro d'objectif: "+$routeParams.sai+" fourni ne correspond à aucune PRESTATION, cette information n'est pas prise en compte.";
																hbAlertMessages.addAlert(
																		"warning", message);
															}
														},
														function(response) {
															var message = "L'obtention d'une PRESTATION pour le numéro d'objectif: "+$routeParams.sai+" a échoué. (statut: "
																	+ response.status
																	+ ")";
															hbAlertMessages.addAlert(
																	"danger", message);
														});													
												}												
												
												
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
									$('#objectifSearchHelper').focus();
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


								// Load ACTEUR `Entreprise` list
								$scope.entrepriseActors = null;
								var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
								hbQueryService.getActors(xpathForEntreprises).then(
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

								// Load ACTEUR `Collaborateur` list
								$scope.collaboratorActors = null;
								var xpathForCollaborators = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";								
								hbQueryService.getActors(xpathForCollaborators).then(										
										function(collaboratorActors) {
											$scope.collaboratorActors = collaboratorActors;
										},
										function(response) {
											var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "
													+ response.status
													+ ")";
											hbAlertMessages.addAlert(
													"danger", message);
										});

								
					            // Parameters to hbChooseOne service function for ACTOR selection
					            $scope.actorChooseOneColumnsDefinition = [
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];
					            
					            $scope.collaboratorActorChooseOneColumnsDefinition = [
					                                                        { field:"IDENTIFIANT.NOM", displayName: "Nom"},
																			{ field:"IDENTIFIANT.ALIAS", displayName: "Prénom"},
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];					            
					            
					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';									

							} ]);

})();
