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
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						$log.debug("    >>>> Using ConstatCardController ");
						
						// TODO: get this dynamically from HB5 catalogue
						$scope.statusTypes = {
							Vu : "Vu",
							SUIVRE : "SUIVRE"
						};

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
						

						// ============================================
						// validation helpers
						// ============================================						
						$scope.getCssHasFeedback = function (ngModelController) {
							return {
								"has-error" : ngModelController.$dirty && ngModelController.$invalid,
								"has-success" : ngModelController.$dirty && ngModelController.$valid, 
								"has-warning" : ngModelController.$pristine && ngModelController.$invalid, // unexpected situation  
							};
						};
						
						$scope.getCssGlyphFeedback = function (ngModelController) {
							return {
								"glyphicon-remove" : ngModelController.$dirty && ngModelController.$invalid,
								"glyphicon-ok" : ngModelController.$dirty && ngModelController.$valid, 
								"glyphicon-warning-sign" : ngModelController.$pristine && ngModelController.$invalid, // unexpected situation  
							};
						};

//						$scope.hasError = function(ngModelController,
//								errorkey) {
//							return ngModelController.$error[errorKey];
//						};												
						// ============================================						
						
						

						
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
			            
			            
			            // Parameter to hbChooseOne service function
			            $scope.actorChooseOneColumnsDefinition = [
			                        		   		            { field:"GROUPE", displayName: "Groupe"}
			                        		   	 		   		];
			            // Parameter to hbChooseOne service function
			            $scope.actorChooseOneTemplate = '/assets/views/chooseActor.html';
						
					} ]);
	

})();