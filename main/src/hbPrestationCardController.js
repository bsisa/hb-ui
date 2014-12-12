(function() {

	angular.module('hb5').controller(
					'HbPrestationCardController',
					[
					 		'$attrs',
							'$scope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							'hbQueryService',
							function($attrs, $scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, hbQueryService) {

								//$log.debug("    >>>> Using HbPrestationCardController");
								
								/**
								 * Selection lists
								 */
						        $scope.transactions = null;
						        $scope.prestationGroups = null;
						        $scope.collaboratorActors = null;

						        /**
						         * Validation support
						         */
					        	$scope.numericOnlyRegexp = /^\d*\.?\d*$/;
					        	// To allow negative values:
					        	//$scope.numericOnlyRegexp = /^[-]?\d*\.?\d*$/;						        
						        
					        	$scope.multiplyBy100 = function(nb) {
					        		  return nb*100;
					        	};
					        	
					            /**
					             * Perform operations once we are guaranteed to have access to $scope.elfin instance.
					             */
						    	$scope.$watch('elfin.Id', function() { 
						    		//$log.debug("    >>>> Using HbPrestationCardController: elfin.Id watch triggered...");
						    		if ($scope.elfin!=null) {
						    			//$log.debug("    >>>> Using HbPrestationCardController: elfin.Id NOT NULL");
							    		if ($attrs.hbMode === "create") {
							    			//$log.debug("    >>>> Using HbPrestationCardController: CREATE MODE");
											if ($scope.elfin) {
												//$log.debug("    >>>> Using HbPrestationCardController: elfin defined");
												// Template fields clean up.
												$scope.elfin.GROUPE = '';
												// CAR2.NOM = 'Motif'
												$scope.elfin.CARACTERISTIQUE.CAR2.VALEUR = '';
												/* Check URL parameters calling IMMEUBLE instance Id, ID_G are valid. 
												 * (Prevents against wrong manual URL typing). 
												 */
												if ( GeoxmlService.validateId($routeParams.Id) && GeoxmlService.validateId($routeParams.ID_G) ) {
													// Get calling IMMEUBLE instance to provide COMPTE, PROPRIETAIRE, OBJECTIF details													
													GeoxmlService.getElfin($routeParams.ID_G,$routeParams.Id).get()
													.then(
														function(immeuble) {
															$scope.elfin.IDENTIFIANT.COMPTE = immeuble.IDENTIFIANT.NOM;
															$scope.elfin.PARTENAIRE.PROPRIETAIRE = immeuble.PARTENAIRE.PROPRIETAIRE;
															/* ===================================================================
															 *   Procedure to find out next PRESTATION OBJECTIF available number
															 * ===================================================================
															 * Improvement: REST API could provide this feature to ensure correct 
															 * result event in highly concurrent usage. Currently a non issue. 
															 */
												            var xpathForPrestations = "//ELFIN[starts-with(IDENTIFIANT/OBJECTIF,'"+immeuble.IDENTIFIANT.OBJECTIF+"')]";
												            hbQueryService.getPrestations(xpathForPrestations)
																.then(function(prestations) {
																		// Some PRESTATION already exist
																		if (prestations.length > 0) {
																			var objectifArray = new Array(0);
																			for (var i = 0; i < prestations.length; i++ ) {
																				var prestation = prestations[i];
																				var objectifSplit = prestation.IDENTIFIANT.OBJECTIF.split('.');
																				if (objectifSplit.length === 2) {
																					var objectifIndex = objectifSplit[1];
																						objectifArray.push(parseInt(objectifIndex.trim()));
																				} else {
																					var splitErrorMsg = "Le calcul de l'objectif de PRESTATION a rencontré un problème: l'objectif suivant appartenant à la prestation avec Id " + prestation.Id + " ne suit pas la structure {No SAI}.{index}: " + prestation.IDENTIFIANT.OBJECTIF + " et n'est par conséquent pas pris en compte pour calculer l'index courrant." ;
																					hbAlertMessages.addAlert("warning",splitErrorMsg);
																				}
																			}
																			// Sort descending
																			objectifArray.sort(function(a, b) { return b - a; });
																			var nextIndex = (objectifArray[0] + 1);
																			$scope.elfin.IDENTIFIANT.OBJECTIF = immeuble.IDENTIFIANT.OBJECTIF + "." + nextIndex;
																		} else { // No PRESTATION exists yet
																			// Create the first PRESTATION index at zero
																			$scope.elfin.IDENTIFIANT.OBJECTIF = immeuble.IDENTIFIANT.OBJECTIF + "." + 0;
																		}
																	},
																	function(response) {
																		var message = "Le chargement des PRESTATIONs a échoué (statut de retour: "+ response.status+ ")";
															            hbAlertMessages.addAlert("danger",message);
																	});														
														},
														function(response) {
															var message = "Le chargement de l'IMMEUBLE de référence pour la création de cette nouvelle PRESTATIONs a échoué (statut de retour: "+ response.status+ ")";
												            hbAlertMessages.addAlert("danger",message);
														});													
													
												} else {
													var message = "Les identifiant Id et ID_G de l'IMMEUBLE depuis lequel cette PRESTATION est créé ne sont pas valides!";
										            hbAlertMessages.addAlert("danger",message);
												}												
											} else {
												$log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
											}
										} else {
											// Do nothing
										}										
						    		};
						    		
						    	}, true);
						        
								
								/**
								 * Maintains the list of TRANSACTION linked to this PRESTATION
								 * 
								 * TODO: Review: transactions must match both:
								 * 1) No SAI (elfin.IDENTIFIANT.OBJECTIF)
								 * 2) Owner (... per node Id,ID_G or ...)
								 * and should thus no only be triggered by elfin.IDENTIFIANT.OBJECTIF change but also
								 * elfin.PARTENAIRE.PROPRIETAIRE.Id modification. 
								 * 
								 * REVIEW: Owner restriction seems not necessary as elfin.IDENTIFIANT.OBJECTIF
								 * information is unique to a single PRESTATION as No SAI + unique index 
								 * such as: 195.22
								 * It could be simpler to link TRANSACTION to PRESTATION with Id (ID_G,Id or CLASSE,Id)  
								 */
								$scope.$watch('elfin.IDENTIFIANT.OBJECTIF', function() { 

						    		if ($scope.elfin!=null) {
							            
							            var xpathForTransactions = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"']";
							            hbQueryService.getTransactions(xpathForTransactions)
											.then(function(elfins) {
													$scope.transactions = elfins;
												},
												function(response) {
													var message = "Le chargement des TRANSACTIONs a échoué (statut de retour: "+ response.status+ ")";
										            hbAlertMessages.addAlert("danger",message);
												});
							            
						    		}
						    		
						    	}, true);
								
								
					            /**
					             * Asychronous PRESTATION template preloading
					             */
					            GeoxmlService.getNewElfin("PRESTATION").get()
					            .then(function(prestation) {
					            		// Get constat types from catalogue
					            		$scope.prestationGroups = hbUtil.buildArrayFromCatalogueDefault(prestation.GROUPE);
					            		// TODO: Waiting for clarifications
					            		//$scope.prestationXXX = hbUtil.buildArrayFromCatalogueDefault(prestation.CARACTERISTIQUE.CAR2.VALEUR);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE PRESTATION n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});

					            /**
					             * Asychronous ACTEUR 'Collaborateur' list preloading
					             */
					            var xpathForActor = "//ELFIN[@CLASSE='ACTEUR' and IDENTIFIANT/QUALITE='Collaborateur']";
					            hbQueryService.getActors(xpathForActor)		
								.then(function(actors) {
										$scope.collaboratorActors = actors;
									},
									function(response) {
										var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "+ response.status+ ")";
							            hbAlertMessages.addAlert("danger",message);
									});					            
					            
					            // Parameters to hbChooseOne service function for ACTOR selection
					            $scope.actorCollaboratorChooseOneColumnsDefinition = [
					                        		   		            { field:"GROUPE", displayName: "Groupe"},
					                        		   		            { field:"IDENTIFIANT.NOM", displayName: "Nom"},
					                        		   		            { field:"IDENTIFIANT.ALIAS", displayName: "Prénom"}
					                        		   	 		   		];
					            
					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';

					            
							} ]);

})();
