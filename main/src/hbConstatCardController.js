(function() {

	angular.module('hb5').controller(
			'HbConstatCardController',
			[
					'$attrs',
					'$rootScope',
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'$filter',
					'hbAlertMessages',
					'hbUtil',
					'HB_EVENTS',
					'HB_REGEXP', 
					'HB_ROLE_FONCTION',
					'userDetails',
					'hbQueryService',
					function($attrs, $rootScope, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, $filter, hbAlertMessages, hbUtil, HB_EVENTS, HB_REGEXP, HB_ROLE_FONCTION, userDetails, hbQueryService) {

						//$log.debug("    >>>> Using ConstatCardController ");

						// Used to provide UNITE_LOCATION (apartments) selection list
						$scope.locationUnits = null;
						// Used to provide navigation link back to IMMEUBLE link to this CONSTAT
						$scope.immeubleRef = null;
						
			        	// Expression used by ng-pattern for numeric only validation.
			        	$scope.numericOnlyRegexp = HB_REGEXP.NUMERIC_POS_ONLY; 

			        	
			        	$scope.messageDecisionList = [{ "name" : "", "value" : ""} ,
			        	                              { "name" : "Accepté", "value" : "Accepté"} ,
			        	                              {	"name" : "En attente", "value" : "En attente"} ,
			        	                              { "name" : "Refusé", "value" : "Refusé"}
			        	                              ];
			        	
			        	// Navigate to IMMEUBLE linked to the current CONSTAT
			        	$scope.viewImmeuble = function() {
			        		$location.path('/elfin/'+$scope.immeubleRef.ID_G+'/IMMEUBLE/' + $scope.immeubleRef.Id);	
			        	};
			        	
			            /**
			             * Perform operations on current CONSTAT elfin once available.
			             */
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {
				    			
				            	// Update some catalogue properties with live data passed as route parameters 
				            	// while in create mode, following an HB_EVENTS.ELFIN_CREATED event. 
								if ( $attrs.hbMode === "create" ) {
								
									if ($scope.elfin) {
								        $scope.buildingNb = $routeParams.nocons;
								        $scope.saiNb = $routeParams.sai;
								        $scope.elfin.IDENTIFIANT.OBJECTIF = $routeParams.sai;
								        $scope.elfin.IDENTIFIANT.COMPTE = $routeParams.nocons;
								        
								        // Prototype generic link to creation source/parent - done for SDS.
								        $scope.elfin.SOURCE = $routeParams.idg +"/"+$routeParams.classe+"/"+$routeParams.id;
								        
								        $scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(new Date());
								        // Default value from catalogue contains statusTypes list: Reset it. 
								        $scope.elfin.IDENTIFIANT.QUALITE = "";
								        // Default value from catalogue contains constatTypes list: Reset it.
								        $scope.elfin.GROUPE = "";
								        // Remove ECHEANCE template from elfin
								        $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.splice(0, 1);
								        
									} else {
										$log.error("elfin should be available after HB_EVENTS.ELFIN_CREATED event notification.");
									}
								} else {
									// Operations relevant only when not in create mode
						            if ($scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE && $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length > 1) {
						            	hbUtil.reorderArrayByPOS($scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE);
						            };
						            $scope.currentEvent = $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE[$scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length-1];
								}			
								
								// We want UNITE_LOCATIVE list both in create and edit mode
				    			// Get UNITE_LOCATIVE corresponding to ELFIN Id of ELFIN[@CLASSE='IMMEUBLE'] by building number
							
								var buildingNb = $scope.elfin.IDENTIFIANT.COMPTE;
								// todo: get IMMEUBLE.Id
								xpathForImmeubleLinkedToCurrentConstat = "//ELFIN[IDENTIFIANT/NOM='"+buildingNb+"']";
								hbQueryService.getImmeubles(xpathForImmeubleLinkedToCurrentConstat)
									.then(function(immeubles) {
										// Expected case
										if (immeubles.length === 1) {
											var immeuble = immeubles[0];
								            var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='"+immeuble.Id+"']";
								            hbQueryService.getLocationUnits(xpathForSurfaces)
												.then(
													function(uniteLocatives) {
														$scope.locationUnits = uniteLocatives;
														$scope.immeubleRef = { "Id" : immeuble.Id,  "ID_G" : immeuble.ID_G , "address": immeuble.IDENTIFIANT.ALIAS, "owner": immeuble.PARTENAIRE.PROPRIETAIRE.NOM};
													},
													function(response) {
														var message = "Le chargement des UNITE_LOCATIVE a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													}
												);
										} else if (immeubles.length < 1) { 
											var message = "TODO: fix this for AMENAGEMENT_SPORTIF context::L'IMMEUBLE correspondant au CONSTAT courrant pour le no de construction "+ buildingNb +" n'a pas pu être trouvé dans la base de donnée!";
								            // 
											$log.error(message);
											//hbAlertMessages.addAlert("danger",message);
										} else {
											var message = "Plusieurs IMMEUBLE correspondent au CONSTAT courrant pour le no de construction: " + buildingNb + ". Le résultat devrait être unique.";
								            hbAlertMessages.addAlert("danger",message);
										}
									},
									function(response) {
										var message = "Le chargement des UNITE_LOCATIVE a échoué (statut de retour: "+ response.status+ ")";
							            hbAlertMessages.addAlert("danger",message);
									});
								
								
								// Override function definition if SOURCE info is available - support for SDS. 
								if ($scope.elfin.SOURCE) {
									
									var splittedSource = $scope.elfin.SOURCE.split('/');
									if (splittedSource.length === 3) {
										var idg = splittedSource[0]
										var classe = splittedSource[1] 
										var id = splittedSource[2]
										var path = '/elfin/'+splittedSource[0]+'/'+classe+'/' + id;	
							        
										$log.debug(">>>> found SOURCE, override viewImmeuble with path = " + path);
								        $scope.viewImmeuble = function() {$location.path(path)};
								        //TODO: should be renamed to parentRef/sourceRef
								        $scope.immeubleRef = { "Id" : id,  "ID_G" : idg , "address": '', "owner": ''};
									}
								}

				    		};
				    		
				    	}, true);
				    	
				    	$scope.$watchCollection('elfin.ACTIVITE.EVENEMENT.ECHEANCE', function(newEcheances, oldEcheances) {
				    		if (!angular.isUndefined(newEcheances) && newEcheances.length > 0) {
				    			// Make sure sorting is done according to POS 
				    			hbUtil.reorderArrayByPOS(newEcheances);
				    			// Update current event with last echeance
					    		$scope.currentEvent = newEcheances[newEcheances.length-1];
					    		$scope.updateEventStatusTooltip();
				    		}			
				        });

						// Get statusTypes dynamically from HB5 catalogue CONSTAT
						$scope.statusTypes = null;
						
			            // Parameter to hbChooseOne service function
						$scope.entrepriseActors = null;
			            // Parameter to hbChooseOne service function
						$scope.collaboratorActors = null;

						/**
						 * Dynamic event status tooltip
						 */
						$scope.eventStatusTooltip = "";
						
						/**
						 * Make tooltip keep in sync. with switch button state.
						 */
						$scope.updateEventStatusTooltip = function() {
							// Protect against call when no currentEvent is defined.
							if (!angular.isUndefined($scope.currentEvent)) {
								if ($scope.currentEvent.PAR_QUI === "EN COURS") {
									$scope.eventStatusTooltip = 'Statut en cours';
								} else if ($scope.currentEvent.PAR_QUI === "A VALIDER") {
									$scope.eventStatusTooltip = 'Statut à valider';
								} else if ($scope.currentEvent.PAR_QUI === "VALIDE") {
									$scope.eventStatusTooltip = 'Statut valide';
								} else {
									$scope.eventStatusTooltip = 'Statut inconnu';
								}								
							}
						};
						
						/**
						 * Make switch button switch from state to state.
						 */
						$scope.switchEventStatus = function (currentEvent) {
							
							if (currentEvent.PAR_QUI === "EN COURS") {
								currentEvent.PAR_QUI = 'A VALIDER';
							} else if (currentEvent.PAR_QUI === "A VALIDER") {
								// Only users with validation role can set status to VALIDE
								if (_.contains(userDetails.getRoles(),HB_ROLE_FONCTION.VALIDATION)) {
									currentEvent.PAR_QUI = 'VALIDE';	
								} else {
									currentEvent.PAR_QUI = 'EN COURS';	
								}
							} else if (currentEvent.PAR_QUI === "VALIDE") {
								currentEvent.PAR_QUI = 'EN COURS';
							} else {
								// If unknown status set it to "EN COURS"
								currentEvent.PAR_QUI = 'EN COURS';
							}
							// Set form to dirty state 
							$scope.elfinForm.$setDirty();
							// Update tooltip
							$scope.updateEventStatusTooltip();
						};
						
						/**
						 * Add ECHEANCE 
						 */
						$scope.addEcheance = function() {
							
							if ($scope.constatEcheanceTemplate && $scope.elfin) {
								
								if ($scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE) {
									// Manage POS 
									$scope.constatEcheanceTemplate.POS = $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length+1;
									// If a preceeding event existed, copy some information from preceeding event 
									// (still available as currentEvent)
									if ($scope.currentEvent) {
										// Copy Manager (Responsable)
										$scope.constatEcheanceTemplate.POUR_QUI = $scope.currentEvent.POUR_QUI;
										// Copy prestation group
										$scope.constatEcheanceTemplate.E_ACTION = $scope.currentEvent.E_ACTION;
										// Copy prestation year
										$scope.constatEcheanceTemplate.E_POUR_QUI = $scope.currentEvent.E_POUR_QUI;
										// Copy estimated amount
										$scope.constatEcheanceTemplate.E_PAR_QUI = $scope.currentEvent.E_PAR_QUI;
									} else {
										// Copy Manager (Responsable)
										$scope.constatEcheanceTemplate.POUR_QUI = userDetails.getAbbreviation();
										// Copy prestation group
										$scope.constatEcheanceTemplate.E_ACTION = "";
										// Copy prestation year
										$scope.constatEcheanceTemplate.E_POUR_QUI = moment().format("YYYY"); // Current year
										// estimated amount
										//$scope.constatEcheanceTemplate.E_PAR_QUI; 
										$scope.constatEcheanceTemplate.ACTION = "Analyse"; // first step
									}
								} else {
									// Manage POS 
									$scope.constatEcheanceTemplate.POS = 1;
									// Set Manager to current user
									$scope.constatEcheanceTemplate.POUR_QUI = userDetails.getAbbreviation();									
								}
								$log.debug("$scope.constatEcheanceTemplate.POS = " + $scope.constatEcheanceTemplate.POS);
								// Set full year in string format
								$scope.constatEcheanceTemplate.E_POUR_QUI = new Date().getFullYear().toString();
								var newConstatEcheanceEntry = $scope.constatEcheanceTemplate;
								// Add new ECHEANCE row
								$scope.addRow($scope.elfin, 'ACTIVITE.EVENEMENT.ECHEANCE', newConstatEcheanceEntry);	
								// Set form to dirty state 
								$scope.elfinForm.$setDirty();
								// Preload new fresh copy of template for new addEcheance call.
								$scope.getNewConstatEcheanceTemplate();
							} else {
								hbAlertMessages.addAlert("warning", "Impossible de créer un nouvel événement. Veuillez s.v.p. contacter votre administrateur et lui reporter cette erreur.");
							}
						};
						
						/**
						 * Add Message as: CARACTERISTIQUE.FRACTION.L.{[C message,C date,C decision]}
						 */
						$scope.addMessage = function() {
							
							var emptyFractionTemplate = { "L": [  ] };
							var messageTemplate = { "C": [ { "POS": 1, "VALUE": ""},
                                     { "POS": 2, "VALUE": "1999-01-01"},
                                     { "POS": 3, "VALUE": ""},
                                     { "POS": 4, "VALUE": ""}], "POS": 1 };
							messageTemplate.C[1].VALUE = hbUtil.getDateInHbTextFormat(new Date());
							
							if ($scope.elfin.CARACTERISTIQUE) {
								if ($scope.elfin.CARACTERISTIQUE.FRACTION) {
									if ($scope.elfin.CARACTERISTIQUE.FRACTION.L) {
										messageTemplate.POS = $scope.elfin.CARACTERISTIQUE.FRACTION.L.length+1;
										$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', messageTemplate);
									} else {
										// FRACTION with no lines
										$scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
										$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', messageTemplate);
									}
								} else {
									// Missing properties are created automatically in JS, thus same code as for empty FRACTION.
									$scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
									$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', messageTemplate);									
								}
							} else {
								// always available in catalogue
							}
						};
						// elfin.CARACTERISTIQUE.FRACTION.L
						

			            //var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
						var xpathForReportedByList = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur' or IDENTIFIANT/QUALITE='Concierge']";
			            var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";

			            // Asychronous entrepriseActors preloading
			            hbQueryService.getActors(xpathForReportedByList)
						.then(function(reportedByActors) {
								$scope.reportedByActors = _.sortBy(reportedByActors, function(actor){ return actor.GROUPE });
							},
							function(response) {
								var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});
			            
			            // Asychronous collaboratorActors preloading
			            hbQueryService.getActors(xpathForCollaborator)
						.then(function(collaboratorActors) {
								$scope.collaboratorActors = collaboratorActors;
							},
							function(response) {
								var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});	
			            

			            $scope.getNewConstatEcheanceTemplate = function() {
				            // Asychronous CONSTAT template preloading
				            GeoxmlService.getNewElfin("CONSTAT").get()
				            .then(function(constat) {
				            		// Get statusTypes from catalogue default
				            		$scope.statusTypes = hbUtil.buildArrayFromCatalogueDefault(constat.IDENTIFIANT.QUALITE);
				            		// Get constat types from catalogue
				            		$scope.constatTypes = hbUtil.buildArrayFromCatalogueDefault(constat.GROUPE);
				            		// Get phase list from ECHEANCE.ACTION default values.
				            		$scope.phaseList = hbUtil.buildArrayFromCatalogueDefault(constat.ACTIVITE.EVENEMENT.ECHEANCE[0].ACTION);
				            		// Get prestation groups from ECHEANCE.E_ACTION default values.
				            		$scope.prestationGroups = hbUtil.buildArrayFromCatalogueDefault(constat.ACTIVITE.EVENEMENT.ECHEANCE[0].E_ACTION);
				            		// Get ECHEANCE template from catalogue
				            		var echeanceTemplate = hbUtil.getEcheanceTemplateFromCatalogue(constat);
							        $scope.constatEcheanceTemplate = echeanceTemplate;
								},
								function(response) {
									var message = "Les valeurs par défaut pour la CLASSE CONSTAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
									hbAlertMessages.addAlert("danger",message);
								});
			            };
			            
			            // First template preloading
			            $scope.getNewConstatEcheanceTemplate();
			            
			            // Parameters to hbChooseOne service function for ACTOR selection
			            $scope.actorCollaboratorChooseOneColumnsDefinition = [
			                        		   		            { field:"GROUPE", displayName: "Groupe"},
			                        		   		            { field:"IDENTIFIANT.NOM", displayName: "Nom"},
			                        		   		            { field:"IDENTIFIANT.ALIAS", displayName: "Prénom"}
			                        		   	 		   		];

			            $scope.actorReportedByChooseOneColumnsDefinition = [
				                        		   		            { field:"GROUPE", displayName: "Nom/Abréviation"},
				                        		   		            { field:"IDENTIFIANT.QUALITE", displayName: "Role"},				                        		   		         
				                        		   	 		   		];
			            
			            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';

			            // Parameter to hbChooseOne service function for ConstatType selection
			            $scope.constatTypeChooseOneColumnsDefinition = [
			                        		   		            { field:"value", displayName: "name"}
			                        		   	 		   		];
			            $scope.constatTypesChooseOneTemplate = '/assets/views/chooseOneConstatType.html';
			            
			            $scope.uniteLocativeChooseOneColumnsDefinition = [
						                        		   		            { field:"IDENTIFIANT.OBJECTIF", displayName: "No SAI"},
						                        		   		         { field:"PARTENAIRE.USAGER.VALUE", displayName: "Locataire"}
						                        		   	 		   		]; 
			            
			            $scope.uniteLocativesChooseOneTemplate = '/assets/views/chooseOneUniteLocative.html';
			            
						
					} ]);

})();