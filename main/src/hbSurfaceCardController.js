(function() {

	angular.module('hb5').controller(
					'HbSurfaceCardController',
					[
							'$scope',
							'$attrs',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							'hbQueryService', 
							'HB_COLLECTIONS',
							function($scope, $attrs, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, hbQueryService, HB_COLLECTIONS) {

								//$log.debug("    >>>> Using HbSurfaceCardController");

								$scope.getMomentDateFromHbTextDateFormat = hbUtil.getMomentDateFromHbTextDateFormat;
								
								$scope.canArchive = function() {
									// If the form is not pristine we could have a valid archiveMoment which is not
									// persisted to database letting us move on to archiveLocationUnit process.
									if ($scope.elfin && $attrs.hbMode !== "create" && $scope.elfinForm.$pristine) {
										var currentMoment = moment();
										var archiveMoment = hbUtil.getMomentDateFromHbTextDateFormat($scope.elfin.IDENTIFIANT.A);
										var canArchive = ( archiveMoment.isAfter(currentMoment) || archiveMoment.isSame(currentMoment, 'day') );
										return canArchive;
									} else {
										return false;
									}
								};
								
								
								$scope.archiveLocationUnit = function() {
									if ($scope.canArchive) {
										// Save current archived LOCATION UNIT
										$scope.saveElfin($scope.elfin);
										// Create new LOCATION_UNIT FROM current one
										var searchObj = {Id: $scope.elfin.Id, ID_G: $scope.elfin.ID_G};
										$location.search(searchObj).path( "/elfin/create/SURFACE" );										
									}
								};
								
						    	// Check when elfin instance becomes available 
						    	$scope.$watch('elfin.Id', function() { 
						    		
						    		if ($scope.elfin!=null) {
						    			/**
						    			 * Perform template clean up tasks while in create mode.
						    			 */
							    		if ($attrs.hbMode === "create") {
							    			$scope.elfin.GROUPE = "";
							    			// Get archived SURFACE if any
							    			if ($routeParams.ID_G && $routeParams.Id) {

								    			GeoxmlService.getElfin($routeParams.ID_G, $routeParams.Id).get()
									            .then(function(archivedLocationUnit) {
									            	// Preserve new Id, ID_G
									            	var newId = angular.copy($scope.elfin.Id);
									            	var newID_G = angular.copy($scope.elfin.ID_G); 
									            	// Copy property value from archived to new
									            	$scope.elfin.IDENTIFIANT = angular.copy(archivedLocationUnit.IDENTIFIANT);
									            	$scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(new Date());
									            	$scope.elfin.IDENTIFIANT.A = "";
									            	
									            	$scope.elfin.PARTENAIRE = angular.copy(archivedLocationUnit.PARTENAIRE);
									            	$scope.elfin.PARTENAIRE.USAGER.VALUE = "";
									            	
									            	$scope.elfin.CARACTERISTIQUE = angular.copy(archivedLocationUnit.CARACTERISTIQUE);
									            	$scope.elfin.ACTIVITE = angular.copy(archivedLocationUnit.ACTIVITE);
									            	$scope.elfin.GROUPE  = angular.copy(archivedLocationUnit.GROUPE);
									            	$scope.elfin.NATURE  = angular.copy(archivedLocationUnit.NATURE);
									            	$scope.elfin.TYPE  = angular.copy(archivedLocationUnit.TYPE);
									            	$scope.elfin.SOURCE  = angular.copy(archivedLocationUnit.SOURCE);

									            	// Force creation of new UNITE LOCATION.
									            	$scope.saveElfin($scope.elfin);
									            	
//									            	$scope.elfin.Id = newId; 
//									            	$scope.elfin.ID_G = newID_G;


												},
												function(response) {
													var message = "Les valeurs par défaut pour la CLASSE UNITE_LOCATIVE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
													hbAlertMessages.addAlert("danger",message);
												});		
							    			} else if ($routeParams.ORIGINE) {
								    			$scope.elfin.IDENTIFIANT.ORIGINE = $routeParams.ORIGINE;
								    			// Build reference to parent IMMEUBLE.
								    			$scope.elfin.SOURCE = HB_COLLECTIONS.IMMEUBLE_ID + "/IMMEUBLE/" + $routeParams.ORIGINE;
							    			}
							    			 
							    		} 
						    		};
						    		
						    	}, true);								
								
						    	GeoxmlService.getNewElfin("SURFACE").get()
					            .then(function(unite_locative) {
					            		// Get groupeChoices from catalogue default
					            	    $scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(unite_locative.GROUPE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE UNITE_LOCATIVE n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});		
						    	
								// Load ACTEUR `Propriétaire` list
								$scope.ownerActors = null;
								var xpathForOwners = "//ELFIN[IDENTIFIANT/QUALITE='Propriétaire']";
								hbQueryService.getActors(xpathForOwners).then(
									function(ownerActors) {
										$scope.ownerActors = ownerActors;
									},
									function(response) {
										var message = "Le chargement des ACTEURS Propriétaire a échoué (statut de retour: "
												+ response.status
												+ ")";
										hbAlertMessages.addAlert(
												"danger", message);
									});						    	
						    	
						    	
					            // Parameters to hbChooseOne service function for ACTOR selection
					            $scope.actorChooseOneColumnsDefinition = [
					                                                      	{ field:"IDENTIFIANT.NOM", displayName: "Nom"},
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];

					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';
						    	
						    	
								
							} ]);

})();
