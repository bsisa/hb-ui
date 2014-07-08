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
					function($attrs, $rootScope, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, $filter, hbAlertMessages, hbUtil, HB_EVENTS) {

						$log.debug("    >>>> Using ConstatCardController ");
						
			            $rootScope.$on(HB_EVENTS.ELFIN_CREATED, function(event, elfin) {

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
								// Do nothing
							}			            	
			            	
			            });

			            /**
			             * Perform operations on current CONSTAT elfin once available
			             */
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {
					            $log.debug("ABOUT TO SORT ECHEANCE ...");
					            if ($scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE && $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length > 1) {
						            $log.debug("Sorting "+$scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length+" ECHEANCEs");
					            	hbUtil.reorderArrayByPOS($scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE);
					            };
					            $scope.currentEvent = $scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE[$scope.elfin.ACTIVITE.EVENEMENT.ECHEANCE.length-1];
				    		};
				    		
				    	}, true);
				    	
				    	$scope.$watchCollection('elfin.ACTIVITE.EVENEMENT.ECHEANCE', function(newEcheances, oldEcheances) {
				    		$scope.currentEvent = newEcheances[newEcheances.length-1];
				        });

						
//			            $scope.deadlinePredicate = 'DATE';
//			            $scope.deadlineReverse = true;
						
						// Get statusTypes dynamically from HB5 catalogue CONSTAT
						$scope.statusTypes = null;
						
			            // Parameter to hbChooseOne service function
						$scope.entrepriseActors = null;
			            // Parameter to hbChooseOne service function
						$scope.collaboratorActors = null;
						

						// ============================================
						// TODO: move to hbDate directive - START
						// ============================================
						//$scope.fromDate = new Date();

						// TODO: should be automatic with $locale providing the correct id i.e.: fr-ch, de-ch,...
						//$scope.dateFormat = 'dd.MM.yyyy';						
						
						
						// Only valid with ui.bootstrap 0.11.0 not 0.10.0						
//						$scope.fromDateOpened = false;
//						$scope.open = function($event) {
//						    $event.preventDefault();
//						    $event.stopPropagation();
//						    if ($scope.fromDateOpened) {
//						    	$log.debug("    >>>>  OPEN -> CLOSE  <<<<");
//						    	$scope.fromDateOpened = false;
//						    } else {
//						    	$log.debug("    >>>>  CLOSE -> OPEN  <<<<");
//						    	$scope.fromDateOpened = true;	
//						    }
//						  };
						// ============================================
						// TODO: move to hbDate directive - END
						// ============================================

						
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
								// Add new ECHEANCE row
								$scope.addRow($scope.elfin, 'ACTIVITE.EVENEMENT.ECHEANCE', $scope.constatEcheanceTemplate);	
								// Set form to dirty state 
								$scope.elfinForm.$setDirty();
							} else {
								hbAlertMessages.addAlert("warning", "Impossible de créer un nouvel événement. Veuillez s.v.p. contacter votre administrateur et lui reporter cette erreur.");
							}
						};
						
						

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