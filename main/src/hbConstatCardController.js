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
						
			            $scope.deadlinePredicate = 'DATE';
			            $scope.deadlineReverse = true;
						
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
			            		// Get ECHEANCE template from catalogue
						        $scope.constatEcheanceTemplate = constat.ACTIVITE.EVENEMENT.ECHEANCE[0];
						        var currentDateHbTextFormat = hbUtil.getDateInHbTextFormat(new Date());
						        $scope.constatEcheanceTemplate.DATE=currentDateHbTextFormat;
						        $scope.constatEcheanceTemplate.ACTION=""; 
						        $scope.constatEcheanceTemplate.PAR_QUI="EN COURS"; 
						        $scope.constatEcheanceTemplate.POUR_QUI="";
						        $scope.constatEcheanceTemplate.E_DATE=currentDateHbTextFormat;;
						        $scope.constatEcheanceTemplate.E_ACTION="";
						        $scope.constatEcheanceTemplate.E_PAR_QUI="0";
						        $scope.constatEcheanceTemplate.E_POUR_QUI="";
						        $scope.constatEcheanceTemplate.E_STATUT="OK";
						        $scope.constatEcheanceTemplate.REMARQUE="";
						        // TODO: manage POS value at insert time (.length + 1) and possibly at delete time (more complicated :) )
						        $scope.constatEcheanceTemplate.POS=1;			            		
			            		
							},
							function(response) {
								var message = "Les valeurs par défaut pour la CLASSE CONSTAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
								hbAlertMessages.addAlert("danger",message);
							});
			            
			            // Parameters to hbChooseOne service function for ACTOR selection
			            $scope.actorChooseOneColumnsDefinition = [
			                        		   		            { field:"GROUPE", displayName: "Groupe"}
			                        		   	 		   		];
			            $scope.actorChooseOneTemplate = '/assets/views/chooseActor.html';

			            // Parameter to hbChooseOne service function for ConstatType selection
			            $scope.constatTypeChooseOneColumnsDefinition = [
			                        		   		            { field:"value", displayName: "name"}
			                        		   	 		   		];
			            $scope.constatTypesChooseOneTemplate = '/assets/views/chooseOneConstatType.html';
						
					} ]);
	

})();