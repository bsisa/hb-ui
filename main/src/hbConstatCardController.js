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
					'userDetails',
					function($attrs, $rootScope, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, $filter, hbAlertMessages, hbUtil, HB_EVENTS, userDetails) {

						$log.debug("    >>>> Using ConstatCardController ");

						// Parameter used to make at least one annex mandatory.
			        	$scope.minBound = 1;

				    	$scope.$watchCollection('elfin.ANNEXE.RENVOI', function(newRenvois, oldRenvois) {
							// We want at least one annex mandatory, except photo, although is should not apply to CONSTAT.
				    		$scope.annexesWithoutPhoto = hbUtil.getAnnexesExcludingTag($scope.elfin, 'photo');
							// Property bound to elfinForm to make at least one annex mandatory.
							$scope.annexesNoPhotoNb = $scope.annexesWithoutPhoto.length;
				        });			        	
						
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
									$scope.eventStatusTooltip = '';
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
								// TODO: user constant service for 'validation' token
								if (_.contains(userDetails.getRoles(),'validation')) {
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
						 * TODO: 
						 * * check roles to allow PAR_QUI => VALIDATE
						 * * check PAR_QUI status to allow / forbid new ECHEANCE creation (no 'EN COURS' nor 'A VALIDER') 
						 */
						$scope.addEcheance = function() {
							
							if ($scope.constatEcheanceTemplate && $scope.elfin) {
								
								if ($scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE) {
									// Manage POS 
									$scope.constatEcheanceTemplate.POS = $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length+1;
								} else {
									// Manage POS 
									$scope.constatEcheanceTemplate.POS = 1;
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
                                     { "POS": 3, "VALUE": ""} ], "POS": 1 };
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
						

				        //   /api/melfin/G20060401225530100?xpath=//ELFIN[IDENTIFIANT/QUALITE='Entreprise']
			            var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
			            var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";
			            //var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE!='Entreprise']";
			            // TODO: actorsCollectionId must come from server configuration resource.
			            $log.debug("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
			            var actorsCollectionId = 'G20060401225530100';
			            
			            // Asychronous entrepriseActors preloading
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForEntreprises})
						.then(function(entrepriseActors) {
								$scope.entrepriseActors = entrepriseActors;
							},
							function(response) {
								var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});
			            
			            // Asychronous collaboratorActors preloading
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForCollaborator})
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

			            $scope.actorCompanyChooseOneColumnsDefinition = [
				                        		   		            { field:"GROUPE", displayName: "Groupe"}
				                        		   	 		   		];
			            
			            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';

			            // Parameter to hbChooseOne service function for ConstatType selection
			            $scope.constatTypeChooseOneColumnsDefinition = [
			                        		   		            { field:"value", displayName: "name"}
			                        		   	 		   		];
			            $scope.constatTypesChooseOneTemplate = '/assets/views/chooseOneConstatType.html';
						
					} ]);

})();