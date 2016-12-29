(function() {

	angular.module('hb5').controller(
			'HbProductionFroidCardController',
			[
			 		'$attrs',
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					'hbQueryService',
					function($attrs, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil, hbQueryService) {

						//$log.debug("    >>>> Using HbProductionFroidCardController ");
						
			 			
						/**
						 * Perform current elfin updates related to parent reference
						 */
						var updateElfinParentRef = function(parentElfin) {
		 					// Set SOURCE to selected building reference triplet ID_G/CLASSE/Id
		 					$scope.elfin.SOURCE = hbUtil.getStandardSourceURI(parentElfin);
		 					// Update OBJECTIF information to preserve historic behaviour. With SOURCE triple it creates data redundancy. 
	 						$scope.elfin.IDENTIFIANT.OBJECTIF = parentElfin.IDENTIFIANT.OBJECTIF;
	 						// No construction 
	 						$scope.elfin.IDENTIFIANT.ORIGINE = parentElfin.NAME;
	 						// Notify and allow end-user to save parent selection modification.
	 						$scope.elfinForm.$setDirty();
						};
						
						/**
						 * Loads elfin parent in scope. `updateElfinParentRef` need to be called from 
						 * within the `GeoxmlService.getElfin` promise thus the ugly `forUpdate` pattern.
						 */
						var getParentElfinInScope = function(idg, id, forUpdate) {

		 					// Get full parent elfin to allow details display in current context.
		 					GeoxmlService.getElfin(idg, id).get().then(function(elfin) {
		 						$scope.parentElfin = elfin;
		 						if (forUpdate) {
		 							updateElfinParentRef($scope.parentElfin);
		 						}
				            }, function() {
				            	var message = "L'objet sélectionné ID_G = " + parentSelection.ID_G + ", Id = " + parentSelection.Id +" n'a pu être obtenu. Un ajustement des configurations peut être nécessaire. Veuillez contacter votre administrateur système. (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("warning",message);
				            });									
						};			 			
			 			
			 			
			 			
			 			
			 			
						// Used to provide navigation link back to IMMEUBLE link to this PRODUCTION_FROID
						$scope.immeubleRef = null;			 			
			 			
			        	// Navigate to IMMEUBLE linked to the current PRODUCTION_FROID
//			        	$scope.viewImmeuble = function() {
//			        		$location.path('/elfin/'+$scope.immeubleRef.ID_G+'/IMMEUBLE/' + $scope.immeubleRef.Id);	
//			        	};
			 			
			        	
//				    	$scope.$watchCollection('[elfin.IDENTIFIANT.OBJECTIF,elfin.IDENTIFIANT.ORIGINE]', function(newValues, oldValues) {							    		
//
//				    		//$log.debug("$watchCollection for OBJECTIF, ORIGINE : " + oldValues[0] + ", " + oldValues[1] + " => " + newValues[0] + ", " + newValues[1]);
//				    		
//				    		if ($scope.elfin!=null && $attrs.hbMode != "create") {
//					    		var saiNb = $scope.elfin.IDENTIFIANT.OBJECTIF;
//								var buildingNb = $scope.elfin.IDENTIFIANT.ORIGINE;
//								xpathForImmeubleLinkedToCurrentProdFroid = "//ELFIN[IDENTIFIANT/OBJECTIF='"+saiNb+"' and IDENTIFIANT/NOM='"+buildingNb+"']";
//								hbQueryService.getImmeubles(xpathForImmeubleLinkedToCurrentProdFroid)
//									.then(function(immeubles) {
//										// Expected case
//										if (immeubles.length === 1) {
//											var immeuble = immeubles[0];
//											$scope.immeubleRef = { "Id" : immeuble.Id,  "ID_G" : immeuble.ID_G , "address": immeuble.IDENTIFIANT.ALIAS, "owner": immeuble.PARTENAIRE.PROPRIETAIRE.NOM};
//										} else if (immeubles.length < 1) { 
//											var message = "L'IMMEUBLE correspondant à la PRODUCTION_FROID courrante pour le no de construction "+ buildingNb +" et no SAI "+ saiNb +" n'a pas pu être trouvé dans la base de donnée!";
//								            hbAlertMessages.addAlert("danger",message);
//										} else {
//											var message = "Plusieurs IMMEUBLE correspondent à la PRODUCTION_FROID courrante pour le no de construction: " + buildingNb +" et no SAI "+ saiNb +". Le résultat devrait être unique.";
//								            hbAlertMessages.addAlert("danger",message);
//										}
//									},
//									function(response) {
//										var message = "Le chargement de l'IMMEUBLE lié à la PRODUCTION_FROID courrante pour le no de construction "+ buildingNb +" et no SAI "+ saiNb + " a échoué (statut de retour: "+ response.status+ ")";
//							            hbAlertMessages.addAlert("danger",message);
//									});										
//				    			
//				    		}
//				    	}, true);
			        	
			 			
						// Get available roles dynamically from HB5 catalogue
				    	$scope.$watch('elfin.Id', function() { 

				    		if ($scope.elfin!=null) {

					            // Asychronous PRODUCTION_FROID template preloading
					            GeoxmlService.getNewElfin("PRODUCTION_FROID").get()
					            .then(function(prodChaleur) {
					            		// Get list from catalogue default
					            		//$scope.xxx = hbUtil.buildArrayFromCatalogueDefault(prodChaleur.IDENTIFIANT.QUALITE);
					            		$scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(prodChaleur.GROUPE);
					            		$scope.energyChoices = hbUtil.buildArrayFromCatalogueDefault(prodChaleur.CARACTERISTIQUE.CAR3.VALEUR);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE PRODUCTION_FROID n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});		
					            
					            
					            var xpathForProviders = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
					            // Asychronous collaboratorActors preloading
					            hbQueryService.getActors(xpathForProviders)
								.then(function(providers) {
										$scope.providers = providers;
									},
									function(response) {
										var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "+ response.status+ ")";
							            hbAlertMessages.addAlert("danger",message);
									});
					            
								if ( $attrs.hbMode === "create" ) {
									
									if ($routeParams.id && $routeParams.idg) {
					 					var forUpdate = true;
					 					getParentElfinInScope($routeParams.idg, $routeParams.id, forUpdate);
									}
									
									// Reset default xxx from catalogue
									$scope.elfin.GROUPE = "";
									$scope.elfin.CARACTERISTIQUE['CAR3'].VALEUR = "";
									
								} else {
									
									if ($routeParams.selectionImmeuble) {
										
					 					$log.debug("$routeParams.selectionImmeuble = " + $routeParams.selectionImmeuble);
					 					// Parse building selection string
					 					var parentSelectionStrSplit = $routeParams.selectionImmeuble.split('/');
					 					var parentSelection = {
					 						"ID_G" : parentSelectionStrSplit[0],
					 						"CLASSE" : parentSelectionStrSplit[1],
					 						"Id" : parentSelectionStrSplit[2]
					 					}
					 					var forUpdate = true;
					 					getParentElfinInScope(parentSelection.ID_G, parentSelection.Id, forUpdate);
					 					
					 				} else {									
										// Load parent reference
					 					var sourceStrSplit = $scope.elfin.SOURCE.split('/');
					 					var source = {
					 						"ID_G" : sourceStrSplit[0],
					 						"CLASSE" : sourceStrSplit[1],
					 						"Id" : sourceStrSplit[2]
					 					}
										var forUpdate = false;
					 					getParentElfinInScope(source.ID_G, source.Id, forUpdate);
					 				}
								}					            
								
								
				    		};	
				    	}, true);			

				    	$scope.actorProvidersChooseOneColumnsDefinition = [
						                        		   		            { field:"GROUPE", displayName: "Nom/Abréviation"},
						                        		   		            { field:"IDENTIFIANT.QUALITE", displayName: "Role"},				                        		   		         
						                        		   	 		   		];
					            
					    $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';				    	
				    	
				    	
				    	
					} ]);
	

})();