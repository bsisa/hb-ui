(function() {

	angular.module('hb5').controller(
			'HbConstatCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'$filter',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, $filter, hbAlertMessages, hbUtil) {

						$log.debug("    >>>> Using ConstatCardController ");
						
						// Get statusTypes dynamically from HB5 catalogue CONSTAT
						$scope.statusTypes = null;
						
			            // Parameter to hbChooseOne service function
						$scope.entrepriseActors = null;
			            // Parameter to hbChooseOne service function
						$scope.collaboratorActors = null;
						

						// ============================================
						// TODO: move to hbDate directive - START
						// ============================================
						$scope.fromDate = new Date();

						// TODO: should be automatic with $locale providing the correct id i.e.: fr-ch, de-ch,...
						$scope.dateFormat = 'dd.MM.yyyy';						
						
						
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
			            //var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";
			            var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE!='Entreprise']";
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
						// TODO: refactor conversion to a service.
			            GeoxmlService.getNewElfin("CONSTAT").get().then(
								function(constat) {
									var statusTypesArray = constat.IDENTIFIANT.QUALITE.split("|");
									var statusTypesJsonString = '{';
									for (var i = 0; i < statusTypesArray.length; i++) {
										statusTypesJsonString += '"' + statusTypesArray[i] + '"' + ':' + '"' + statusTypesArray[i] + '"';  
										if (i < (statusTypesArray.length - 1)) {
											statusTypesJsonString += ',';
										}
									};
									statusTypesJsonString += '}';
									
									$log.debug(">>>> CONSTAT: statusTypesJsonString (4) = " + statusTypesJsonString);
									
									var statusTypesObj = angular.fromJson(statusTypesJsonString);
									$scope.statusTypes = statusTypesObj;
								},
								function(response) {
									var message = "Les valeurs par défaut pour la CLASSE CONSTAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
									hbAlertMessages.addAlert("danger",message);
							});
			            
			            
			            // Parameter to hbChooseOne service function
			            $scope.actorChooseOneColumnsDefinition = [
			                        		   		            { field:"GROUPE", displayName: "Groupe"}
			                        		   	 		   		];
			            // Parameter to hbChooseOne service function
			            $scope.actorChooseOneTemplate = '/assets/views/chooseActor.html';
						
					} ]);
	

})();