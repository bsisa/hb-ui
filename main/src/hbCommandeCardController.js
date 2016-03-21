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
							'HB_ORDER_TYPE',
							'userDetails',
							'hbQueryService',
							'$window',
							function($attrs, $scope, $rootScope, GeoxmlService,
									$modal, $routeParams, $location, $log,
									$timeout, hbAlertMessages, hbUtil,
									HB_EVENTS, HB_ORDER_TYPE, userDetails, hbQueryService, $window) {
								
								$scope.OBJECTS_SELECTION_TYPE_IMMEUBLE = "IMMEUBLE";
								$scope.OBJECTS_SELECTION_TYPE_SURFACE = "SURFACE";
								
								// Can be dynamically updated given user roles, functions.
								$scope.canEdit = true;

								// Expose order type constants to scope
								$scope.HB_ORDER_TYPE = HB_ORDER_TYPE;
								
						    	GeoxmlService.getNewElfin("COMMANDE").get()
					            .then(function(order) {
					            		// Get typeChoices from catalog default
					            	    $scope.typeChoices = hbUtil.buildArrayFromCatalogueDefault(order.IDENTIFIANT.QUALITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE COMMANDE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});	
								
						    	$scope.objectsSelectionTypeChoices = hbUtil.buildArrayFromCatalogueDefault($scope.OBJECTS_SELECTION_TYPE_IMMEUBLE+"|"+$scope.OBJECTS_SELECTION_TYPE_SURFACE);
						    	
								$scope.selected = { 
										"building" : null,
										"code" : null,
										"objectsSelectionType" : null ,
										"provider" : null,
										"surface" : null,
										"initialised" : false
									};

								/**
								 * Set respActorModel.Id to undefined to prevent validation activation if unused.
								 */
								$scope.respActorModel = {Id : undefined, ID_G : "", GROUPE : "", NOM : ""}; //
								
								/**
								 * Proceed with CARACTERISTIQUE.FRACTION.L update depending on order type selection.
								 * 
								 */
								$scope.processOrderTypeChange = function(selectedType){
 									if (selectedType === HB_ORDER_TYPE.PURCHASE) {
										$scope.elfin.CARACTERISTIQUE.FRACTION.L = hbUtil.getOrderPurchaseLines();
										// Reset field information meaningless to purchase order context.
										$scope.elfin.IDENTIFIANT.RES = "";
									} else if (selectedType === HB_ORDER_TYPE.CONFIRMATION) {
										$scope.elfin.CARACTERISTIQUE.FRACTION.L = hbUtil.getOrderConfirmationLines();
									} else if (selectedType === HB_ORDER_TYPE.CONTRACT) {
										$scope.elfin.CARACTERISTIQUE.FRACTION.L = hbUtil.getOrderContractLines();
									} else {
										var message = "Le type de COMMANDE "+ selectedType +" n'est pas encore pris en compte veuillez s.v.p. contacter l'administrateur du système.";
										hbAlertMessages.addAlert("danger",message);
									}
								};								

								
								/**
								 * Update current COMMANDE SOURCE information detecting whether 
								 * creation context is linked to IMMEUBLE or SURFACE. 
								 */
								var updateSource = function() {
									if ($scope.selected.surface !== null && $scope.selected.surface.Id) {
										$scope.elfin.SOURCE = $scope.selected.surface.ID_G + "/" + $scope.selected.surface.CLASSE + "/" + $scope.selected.surface.Id;
										// Set order (COMMANDE) ALIAS to SURFACE OBJECTIF (no SAI - no object)
										$scope.elfin.IDENTIFIANT.ALIAS = $scope.selected.surface.IDENTIFIANT.OBJECTIF;
									} else if ($scope.selected.building !== null && $scope.selected.building.Id) {
										$log.debug("/!\ updateSource NO selected.surface.Id /!\ ");
										$scope.elfin.SOURCE = $scope.selected.building.ID_G + "/" + $scope.selected.building.CLASSE + "/" + $scope.selected.building.Id;		
										// TODO: review if it is the best place to reset ALIAS ? 
									} else {
										$log.debug("No relevant information to perform SOURCE update. Reset it to blank.");
										$scope.elfin.SOURCE = "";
									}
								};								
								
								
								var setSelectedSurface = function(ID_G, Id) {
				    				GeoxmlService.getElfin(ID_G, Id).get()
							        .then(function(surfaceElfin) {
							        	// Force CAR array sorting by POS attribute
							        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
							        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
							        	//       Need review of other similar operations
							        	if ( surfaceElfin['CARACTERISTIQUE'] != null && surfaceElfin['CARACTERISTIQUE']['CARSET'] != null && surfaceElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
							        		hbUtil.reorderArrayByPOS(surfaceElfin['CARACTERISTIQUE']['CARSET']['CAR']);
							        	}
						    			$scope.selected.surface = surfaceElfin;
						    			var selectedParentIds = hbUtil.getIdentifiersFromStandardSourceURI(surfaceElfin.SOURCE);
						    			// Also manages $scope.selected.initialised state
						    			setSelectedBuilding(selectedParentIds.ID_G,selectedParentIds.Id);
							        }, function(response) {
							        	var message = "Aucun object IMMEUBLE disponible pour la collection: " + selectedBuildingIds.ID_G + " et l'identifiant: " + selectedBuildingIds.Id + ".";
							        	$log.warn("HbCommandeCardController - statut de retour: " + response.status + ". Message utilisateur: " + message);
							        });	
								};
								
								
								/**
								 * Set selected.building scope variable given building ID_G, Id identifiers.
								 */
								var setSelectedBuilding = function(ID_G, Id) {
				    				GeoxmlService.getElfin(ID_G, Id).get()
							        .then(function(buildingElfin) {
							        	// Force array sorting by POS attribute.
							        	if ( buildingElfin['CARACTERISTIQUE'] != null && buildingElfin['CARACTERISTIQUE']['CARSET'] != null && buildingElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
							        		hbUtil.reorderArrayByPOS(buildingElfin['CARACTERISTIQUE']['CARSET']['CAR']);
							        	}
						    			$scope.selected.building = buildingElfin;
						    			// Stop waiting for building initialisation once obtained.
						    			$scope.selected.initialised = true;
							        }, function(response) {
							        	var message = "Aucun object IMMEUBLE disponible pour la collection: " + selectedBuildingIds.ID_G + " et l'identifiant: " + selectedBuildingIds.Id + ".";
							        	$log.warn("HbCommandeCardController - statut de retour: " + response.status + ". Message utilisateur: " + message);
							        });	
								};								
								
								var getCARX = function(elfin, nbX ) {
									var carX = "CAR" + nbX;
									if (elfin && elfin.CARACTERISTIQUE && elfin.CARACTERISTIQUE[carX]) {
										var emailLength = elfin.CARACTERISTIQUE[carX].VALEUR.trim().length;
										if (emailLength > 0) {
											return elfin.CARACTERISTIQUE[carX].VALEUR; 
										} else {
											return "Non spécifié";
										};
									} else {
										return "Non spécifié";
									}									
								};

								$scope.getPhone = function(elfin) {
									return getCARX(elfin,"4");
								};								
								
								$scope.getEmail = function(elfin) {
									return getCARX(elfin,"5");
								};
								
								$scope.getRole = function(elfin) {
									return getCARX(elfin,"6");
								};																
								
								// Manage contract / confirmation manager
								$scope.$watch('respActorModel', function(newResp, oldResp) {
									if (newResp.Id !== undefined) {
										$scope.elfin.IDENTIFIANT.RES = newResp.ID_G + "/ACTEUR/" + newResp.Id;
									}
								}, true);								
								
								$scope.$watch('selected.objectsSelectionType', function(toType,fromType) {
									
									if ($scope.selected.initialised === true ) {
										
										if (fromType === $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE && toType === $scope.OBJECTS_SELECTION_TYPE_SURFACE) {
						    				// Reset any SURFACE info
						    				$scope.selected.surface = null;
						    				// Reset any IMMEUBLE info
						    				$scope.selected.building = null;
						    				// COMMANDE SOURCE info update
						    				updateSource();
										} else if (fromType === $scope.OBJECTS_SELECTION_TYPE_SURFACE && toType === $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE) {
						    				// Reset any SURFACE INFO
						    				$scope.selected.surface = null;
						    				// COMMANDE SOURCE info update
						    				updateSource();
										}
									}
								}, true);								

								
								/**
								 * Listen to selected.building change and perform corresponding $scope.elfin updates
								 */
								$scope.$watch('selected.building', function(newBuilding, oldBuilding) { 
									//$log.debug(">>>> selected.building listener: newBuilding = " + angular.toJson(newBuilding) + ", oldBuilding = " + angular.toJson(oldBuilding));
									if ($scope.selected.initialised === true ) {
										if ($scope.selected.building) {
											$log.debug(">>>> selected.building listener: newBuilding = " + newBuilding.IDENTIFIANT.OBJECTIF);

											// COMMANDE SOURCE info update
											updateSource();
											
											// Set order (COMMANDE) OBJECTIF to building (IMMEUBLE) OBJECTIF (no SAI)
											$scope.elfin.IDENTIFIANT.OBJECTIF = $scope.selected.building.IDENTIFIANT.OBJECTIF;

											// Set order ORIGINE to building (IMMEUBLE) NOM (No construction)
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
											$log.debug("building has been reset... ");											
											$scope.elfin.SOURCE = "";
											$scope.elfin.IDENTIFIANT.OBJECTIF = "";
											$scope.elfin.IDENTIFIANT.ALIAS = "";
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
								
								
								$scope.$watch('selected.surface', function(newSurface, oldSurface) { 
									if ($scope.selected.initialised === true && $scope.selected.surface && $scope.selected.surface.Id) {
										$log.debug("selected.surface : \n" + angular.toJson($scope.selected.surface.IDENTIFIANT.OBJECTIF));
										// will deadloop, should be renamed init selected surface.
										//setSelectedSurface($scope.selected.surface.ID_G,$scope.selected.surface.Id)
										if ($scope.selected.surface) {
											var selectedParentIds = hbUtil.getIdentifiersFromStandardSourceURI($scope.selected.surface.SOURCE);
											// Also manages $scope.selected.initialised state
											setSelectedBuilding(selectedParentIds.ID_G,selectedParentIds.Id);
										} else {
											$log.debug("no $scope.selected.surface available yet...");
											// Reset 
											$scope.elfin.IDENTIFIANT.ALIAS = "";
										}
									} else {
										//$log.debug("selected.code : " + angular.toJson($scope.selected.code) + " ... WAITING for initialisation...");
									}
								}, true);								
								
								$scope.$watch('selected.code', function(newCode, oldCode) { 
									if ($scope.selected.initialised === true ) {
										// TODO: Review hb-typeahead-code implementation to expose only valid code object
										// the kind of verifications performed hereafter should be encapsulated within the
										// directives (typehead or choose).
										if ($scope.selected.code !== null && $scope.selected.code !== undefined) {
											//$log.debug("selected.code : " + angular.toJson($scope.selected.code));											
											$scope.elfin.GROUPE = $scope.selected.code.IDENTIFIANT.NOM;
										} else {
											//$log.debug("selected.code has been reset... ");											
											$scope.elfin.GROUPE = "";
										}
									} else {
										//$log.debug("selected.code : " + angular.toJson($scope.selected.code) + " ... WAITING for initialisation...");
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

						    			// Initialise contract/confirmation manager
						    			var respActorModelRef = hbUtil.getIdentifiersFromStandardSourceURI($scope.elfin.IDENTIFIANT.RES);
						    			if (respActorModelRef === undefined) {
						    				$log.debug(">>>> respActorModelRef undefined ! = " + angular.toJson(respActorModelRef));
						    				$scope.respActorModel = {Id : undefined, ID_G : "", GROUPE : "", NOM : ""};
						    			} else {
						    				$log.debug(">>>> respActorModelRef defined !   = " + angular.toJson(respActorModelRef));
						    				$scope.respActorModel = {Id : respActorModelRef.Id, ID_G : respActorModelRef.ID_G, GROUPE : "", NOM : ""};
						    			}
						    			
						    			// Supports create mode and avoids repeating selected.initialised setting 
						    			var selectedParentIds = hbUtil.getIdentifiersFromStandardSourceURI($scope.elfin.SOURCE);
						    			if (selectedParentIds) {
						    				if (selectedParentIds.CLASSE === 'IMMEUBLE') {
						    					setSelectedBuilding(selectedParentIds.ID_G, selectedParentIds.Id);	
						    				} else if (selectedParentIds.CLASSE === 'SURFACE') {
						    					setSelectedSurface(selectedParentIds.ID_G, selectedParentIds.Id);
						    				}
						    			} else {
							    			// If no reference to building exists confirm initialisation is complete.
							    			$scope.selected.initialised = true;
						    			}
						    			// ====================================================================						    			
						    			
										// Update elfin properties from catalog while in create mode
										if ($attrs.hbMode === "create") {
											
											if ($scope.elfin) {
												
												// ===================================================
												//   Reset catalog default values 
												// =================================================== 
												
												// SAI nb.
												$scope.elfin.IDENTIFIANT.OBJECTIF = "";
												
												// Order type
												$scope.elfin.IDENTIFIANT.QUALITE = "Bon de commande";
												
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
													if ($routeParams.classe === 'IMMEUBLE') {
														$scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE;
														setSelectedBuilding($routeParams.idg, $routeParams.id);	
													} else if ($routeParams.classe === 'SURFACE')  {
														$scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_SURFACE;
														setSelectedSurface($routeParams.idg, $routeParams.id);
													}
												} else {
													$scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_SURFACE;
												}
											} else {
												$log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
											}
										} else { // Not in create mode
											// Check whether the COMMANDE.SOURCE points to a SURFACE or IMMEUBLE 
											if (_.contains($scope.elfin.SOURCE, 'IMMEUBLE') ) {
												$scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_IMMEUBLE;
											} else {
												$scope.selected.objectsSelectionType = $scope.OBJECTS_SELECTION_TYPE_SURFACE;
											}
										} // end of "Not in create mode" operations
										
						    			// Initialises selected.code from elfin.GROUPE value
						    			// Can be useful in create mode if a default group is defined
						    			// but requires to be performed after creation initialisation procedure 
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
						    			}// end of selected.code init										

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
						        
						        /**
						         * Prints provider purchase order.
						         */
						        $scope.printProviderPurchaseOrderReport = function (elfin) {
						        	$window.open("/api/melfin/report/G20050101000012345/G20160112111800000?col="+elfin.ID_G+"&id="+elfin.Id);
						        };					        
						        
						        /**
						         * Prints tenant purchase order.
						         */
						        $scope.printTenantPurchaseOrderReport = function (elfin) {
						        	$window.open("/api/melfin/report/G20050101000012345/G20160210190000000?col="+elfin.ID_G+"&id="+elfin.Id);
						        };							        
					            

						        /**
						         * Prints entreprise contract.
						         */
						        $scope.printEntrepriseContractReport = function (elfin) {
						        	$window.open("/api/melfin/report/G20050101000012345/G20160226150000001?col="+elfin.ID_G+"&id="+elfin.Id);
						        };
						        

						        /**
						         * Prints order confirmation.
						         */
						        $scope.printOrderConfirmationReport = function (elfin) {
						        	$window.open("/api/melfin/report/G20050101000012345/G20160226150000002?col="+elfin.ID_G+"&id="+elfin.Id);
						        };
						        
						        
						        
						        // Set focus to building (orderNb is automatically set and should not be changed)
								var focusOnField = function() {
									$('#building').focus();
								};						      
								
								// Call set focus to orderNb with a 500 millisec delay.
								$timeout(focusOnField, 500, false);    									
								
					            
							} ]);

})();
