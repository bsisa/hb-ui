(function() {

	angular
			.module('hb5')
			.controller(
					'HbCommandeCardController',
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

								
								// Can be dynamically updated given user roles, functions.
								$scope.canEdit = true;

								
						    	GeoxmlService.getNewElfin("COMMANDE").get()
					            .then(function(order) {
					            		// Get typeChoices from catalog default
					            	    $scope.typeChoices = hbUtil.buildArrayFromCatalogueDefault(order.IDENTIFIANT.QUALITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE COMMANDE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});	
								
								$scope.typeChoices = 
								
								$scope.selected = { 
										"building" : {},
										"code" : null,
										"provider" : {},
										"initialised" : false
									};
								
								/**
								 * Set selected.building scope variable given building ID_G, Id identifiers.
								 */
								var setSelectedBuilding = function(ID_G, Id) {
				    				GeoxmlService.getElfin(ID_G, Id).get()
							        .then(function(buildingElfin) {
							        	// Force CAR array sorting by POS attribute
							        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
							        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
							        	//       Need review of other similar operations
							        	if ( buildingElfin['CARACTERISTIQUE'] != null && buildingElfin['CARACTERISTIQUE']['CARSET'] != null && buildingElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
							        		hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
							        	}
						    			$scope.selected.building = buildingElfin;
						    			// Wait for building initialisation if one if referenced
						    			$scope.selected.initialised = true;
							        }, function(response) {
							        	var message = "Aucun object IMMEUBLE disponible pour la collection: " + selectedBuildingIds.ID_G + " et l'identifiant: " + selectedBuildingIds.Id + ".";
							        	$log.warn("HbCommandeCardController - statut de retour: " + response.status + ". Message utilisateur: " + message);
							        });	
								};								
								
								/**
								 * Listen to selected.building change and perform corresponding $scope.elfin updates
								 */
								$scope.$watch('selected.building', function(newBuilding, oldBuilding) { 
									if ($scope.selected.initialised === true ) {
										if ($scope.selected.building) {
											//$log.debug("building : " + angular.toJson($scope.selected.building));											
											$scope.elfin.SOURCE = $scope.selected.building.ID_G + "/" + $scope.selected.building.CLASSE + "/" + $scope.selected.building.Id;
											// Gets building object and set its OBJECTIF to the COMMANDE OBJECTIF (no SAI)
											$scope.elfin.IDENTIFIANT.OBJECTIF = $scope.selected.building.IDENTIFIANT.OBJECTIF;
											// Gets building object and set its NOM (No construction) to the COMMANDE ORIGINE (The COMMANDE NOM is reserved for COMMANDE number)
											$scope.elfin.IDENTIFIANT.ORIGINE = $scope.selected.building.IDENTIFIANT.NOM;
											var buildingOwner = {
													 "Id" : $scope.selected.building.PARTENAIRE.PROPRIETAIRE.Id,
												      "ID_G" : $scope.selected.building.PARTENAIRE.PROPRIETAIRE.ID_G,
												      "NOM" : $scope.selected.building.PARTENAIRE.PROPRIETAIRE.NOM,
												      "GROUPE" : $scope.selected.building.PARTENAIRE.PROPRIETAIRE.GROUPE,
												      "VALUE" : ""
												};
											$scope.elfin.PARTENAIRE.PROPRIETAIRE = buildingOwner; 
										} else {
											//$log.debug("building has been reset... ");											
											$scope.elfin.SOURCE = "";
											$scope.elfin.IDENTIFIANT.OBJECTIF = "";
											$scope.elfin.IDENTIFIANT.ORIGINE = "";
											var buildingOwner = {
													 "Id" : "",
												      "ID_G" : "",
												      "NOM" : "",
												      "GROUPE" : "",
												      "VALUE" : ""
												};
											$scope.elfin.PARTENAIRE.PROPRIETAIRE = buildingOwner;
										}
									} else {
										$log.debug("building : " + angular.toJson($scope.selected.building) + " ... WAITING for initialisation...");
									}
								}, true);								
								
								
								$scope.$watch('selected.code', function(newCode, oldCode) { 
									if ($scope.selected.initialised === true ) {
										// TODO: Review hb-typeahead-code implementation to expose only valid code object
										// the kind of verifications performed hereafter should be encapsulated within the
										// directives (typehead or choose).
										if ($scope.selected.code !== null && $scope.selected.code !== undefined) {
											$log.debug("selected.code : " + angular.toJson($scope.selected.code));											
											$scope.elfin.GROUPE = $scope.selected.code.IDENTIFIANT.NOM;
										} else {
											$log.debug("selected.code has been reset... ");											
											$scope.elfin.GROUPE = "";
										}
									} else {
										$log.debug("selected.code : " + angular.toJson($scope.selected.code) + " ... WAITING for initialisation...");
									}
								}, true);								
								
								$scope.$watch('selected.provider', function(newProvider, oldProvider) { 
									if ($scope.selected.initialised === true ) {
										if ($scope.selected.provider) {
											//$log.debug("provider : " + angular.toJson($scope.selected.provider));											
											var provider = {
											      "Id" : $scope.selected.provider.Id,
											      "ID_G" : $scope.selected.provider.ID_G,
											      "NOM" : "",
											      "GROUPE" : $scope.selected.provider.GROUPE,
											      "VALUE" : ""
											};
											$scope.elfin.PARTENAIRE.FOURNISSEUR = provider;
											// Updating $scope.selected.provider model from hbChooseOne controller is not 
											// visible to the view model thus requires manual update.
											// This is necessary when the validity state has been set to invalid using 
											// typeahead manual typing, then solving selection through hbChooseOne selection.
											// The latter selection will not be noticed by the view model and thus not reset
											// the field validity state correctly.
											$scope.elfinForm.fournisseur.$setValidity('editable', true)
										} else {
											//$log.debug("provider has been reset... ");											
											var provider = {
												      "Id" : "",
												      "ID_G" : "",
												      "NOM" : "",
												      "GROUPE" : "",
												      "VALUE" : ""
												};
											$scope.elfin.PARTENAIRE.FOURNISSEUR = provider;											
										}
									} else {
										$log.debug("provider : " + angular.toJson($scope.selected.provider) + " ... WAITING for initialisation...");
									}
								}, true);
								

								// Select all IMMEUBLE
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
						    	
								
								
								// Select all CODE where GROUPE = 'CFC'
								var xpathForCfcCodes = "//ELFIN[@CLASSE='CODE' and @GROUPE='CFC']";
								// Asychronous buildings preloading
								hbQueryService.getCodes(xpathForCfcCodes)
									.then(
											function(cfcCodes) {
												$scope.cfcCodes = _.sortBy(cfcCodes, function(cfcCode){ return cfcCode.CARACTERISTIQUE.CAR1.VALEUR });
												$log.debug(">>> CODES.CFC: " + cfcCodes.length);
											},
											function(response) {
												var message = "Le chargement de la liste de CODE CFC a échoué (statut de retour: "
														+ response.status
														+ ")";
												hbAlertMessages.addAlert("danger", message);
											}
										);								
								
					            /**
					             * Perform operations once we are guaranteed to have access to $scope.elfin instance.
					             */
						    	$scope.$watch('elfin.Id', function() { 

						    		if ($scope.elfin!==null) {

						    			$scope.selected.provider = {
											      "Id" : $scope.elfin.PARTENAIRE.FOURNISSEUR.Id,
											      "ID_G" : $scope.elfin.PARTENAIRE.FOURNISSEUR.ID_G,
											      "NOM" : "",
											      "GROUPE" : $scope.elfin.PARTENAIRE.FOURNISSEUR.GROUPE,
											      "VALUE" : ""
											    };
						    			//$scope.elfin.PARTENAIRE.FOURNISSEUR.VALUE
						    			var selectedBuildingIds = hbUtil.getIdentifiersFromStandardSourceURI($scope.elfin.SOURCE);
						    			if (selectedBuildingIds) {
						    				setSelectedBuilding(selectedBuildingIds.ID_G, selectedBuildingIds.Id);
						    			} else {
							    			// If no reference to building exists confirm initialisation is complete.
							    			$scope.selected.initialised = true;
						    			}
						    			
						    			// Initialise selected.code from elfin.GROUPE value.
						    			if ($scope.elfin.GROUPE && $scope.elfin.GROUPE.trim().length > 0) {
						    				
											// Select the CODE where GROUPE = 'CFC' and number matches IDENTIFIANT.NOM
											var xpathForCfcCode = "//ELFIN[@CLASSE='CODE' and @GROUPE='CFC' and IDENTIFIANT/NOM='"+$scope.elfin.GROUPE+"']";
											// Asychronous buildings preloading
											hbQueryService.getCodes(xpathForCfcCode)
												.then(
														function(cfcCodes) {
															$log.debug(">>> cfcCodes.length MUST equal 1 : " + cfcCodes.length);
															if (cfcCodes.length === 1) {
																$scope.selected.code = cfcCodes[0];																
															} else {
																var message = "Le code CFC " + $scope.elfin.GROUPE + " n'est pas valide, veuillez s.v.p. effectuer une sélection parmi les codes existants.";
																hbAlertMessages.addAlert("danger", message);
															}
														},
														function(response) {
															var message = "La recherche du code CFC "+ $scope.elfin.GROUPE + " a échoué (statut de retour: " + response.status + ")";
															hbAlertMessages.addAlert("danger", message);
														}
													);						    				
						    			}
						    			
										// Update elfin properties from catalog while in create mode
										if ($attrs.hbMode === "create") {
											
											if ($scope.elfin) {
												
												// ===================================================
												//   Reset catalog default values 
												// =================================================== 
												
												// SAI nb.
												$scope.elfin.IDENTIFIANT.OBJECTIF = "";
												
												// No construction of source IMMEUBLE
												$scope.elfin.IDENTIFIANT.ORIGINE = "";

												// CFC code
												$scope.elfin.GROUPE = "";
												
												// Default value from catalogue contains repartition list: Reset it.
												$scope.elfin.IDENTIFIANT.VALEUR = "";

												GeoxmlService.getNewOrderNumber().get().then(function(number) {
														// Reserved for future semantic identifier nb. 
														$scope.elfin.IDENTIFIANT.NOM = number;													
													},
													function(response) {
														var message = "Le numéro de commande n'a pas pu être obtenu. (statut de retour: "+ response.status+ ")";
														hbAlertMessages.addAlert("danger",message);
													});	
												
												
												// Reset entreprise service provider 
												$scope.elfin.PARTENAIRE.FOURNISSEUR.Id = "";
												$scope.elfin.PARTENAIRE.FOURNISSEUR.ID_G = "";
												$scope.elfin.PARTENAIRE.FOURNISSEUR.NOM = ""; 
												$scope.elfin.PARTENAIRE.FOURNISSEUR.GROUPE = "";
												$scope.elfin.PARTENAIRE.FOURNISSEUR.VALUE = "";
															
												// Reset building provider 
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id = "";
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G = "";
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM = ""; 
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.GROUPE = "";
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE = "";
												
												$scope.elfin.DIVERS.REMARQUE = "";

												// ===================================================
												//   Initialises default values using parameters 
												//   if provided 
												// ===================================================
												var currentDate = new Date();
												$scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(currentDate);
												// Current date is not a relevant deadline but helps end-user with data entry
												$scope.elfin.IDENTIFIANT.A = hbUtil.getDateInHbTextFormat(currentDate);

												// Get user abbreviation from userDetails service
												$scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation();
												
												// Initialise selected building using provided IMMEUBLE parameters
												if ($routeParams.idg && $routeParams.id) {
													setSelectedBuilding($routeParams.idg, $routeParams.id);
												}
											} else {
												$log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
											}
										}
									}
						    	}, true);								

						    	// TODO: check if used
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

								
					            // Parameters to hbChooseOne service function for ACTOR selection
                             	//{ field:"CARACTERISTIQUE.CAR1.VALEUR", displayName: "Ordre de tri"},
//					            $scope.codeChooseOneColumnsDefinition = [
//						                        		   		            { field:"IDENTIFIANT.NOM", displayName: "Code CFC"},
//						                        		   		            { field:"DIVERS.REMARQUE", displayName: "Description"}
//						                        		   	 		   		];								
//					            $scope.codeChooseOneTemplate = '/assets/views/chooseOneCode.html';
					            
								
					            // Parameters to hbChooseOne service function for ACTOR selection
					            $scope.actorChooseOneColumnsDefinition = [
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];
					            
					            $scope.collaboratorActorChooseOneColumnsDefinition = [
					                                                        { field:"IDENTIFIANT.NOM", displayName: "Nom"},
																			{ field:"IDENTIFIANT.ALIAS", displayName: "Prénom"},
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];					            
					            
					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor2.html';									

					            
								// Allow direct call to new TRANSACTION creation without going through menus items.
								$scope.createNewCommande = function () {
		    	                   	var redirUrl = '/elfin/create/COMMANDE';
		    	                   	$location.path( redirUrl );						        	
						        };					            
					            
						        // Set focus to building (orderNb is automatically set and should not be changed)
								var focusOnField = function() {
									$('#building').focus();
								};						      
								
								// Call set focus to orderNb with a 500 millisec delay.
								$timeout(focusOnField, 500, false);    									
								
					            
							} ]);

})();
