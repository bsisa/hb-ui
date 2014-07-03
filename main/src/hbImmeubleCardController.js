(function() {

	    angular
			.module('hb5')
			.controller(
					'HbImmeubleCardController',
					[
							'$scope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							function($scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout, hbAlertMessages,
									hbUtil) {
    
									$log.debug("    >>>> Using HbImmeubleCardController");
									
							        $scope.constatsEncours = null;
							        $scope.constatsClos = null;
							        $scope.prestations = null;
							        $scope.surfaces = null;
							    	
							        
									// Triggers a redirection to the CONSTAT creation URL with current 
									// IMMEUBLE building number and SAI number passed as parameters.
									$scope.createNewConstat = function() {
										var searchObj = {nocons: $scope.elfin.IDENTIFIANT.NOM, sai: $scope.elfin.IDENTIFIANT.OBJECTIF}
										$location.search(searchObj).path( "/elfin/create/CONSTAT" );	
									};									
									
									// Extracts file name for ANNEXE/RENVOI/LIEN corresponding to a photo.
									$scope.getLienFileName = function (lien) {
										var splitString = lien.split('/');
										return splitString[splitString.length-1];
									};							        
							        
							        
							    	// Watch related to CONSTAT list in the context of elfin of CLASSE IMMEUBLE 
							        // hence the dedicated controller.
							    	$scope.$watch('elfin.IDENTIFIANT.NOM', function() { 

							    		if ($scope.elfin!=null) {
								            var xpathForConstatsEncours = "//ELFIN[IDENTIFIANT/COMPTE='"+$scope.elfin.IDENTIFIANT.NOM+"'][not(IDENTIFIANT/A) or IDENTIFIANT/A='']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: constatsCollectionId must come from server configuration resource.");
								            var constatsCollectionId = 'G20060920171100001';
								            GeoxmlService.getCollection(constatsCollectionId).getList({"xpath" : xpathForConstatsEncours})
												.then(function(elfins) {
														$scope.constatsEncours = elfins;
													},
													function(response) {
														var message = "Le chargement des CONSTATs en cours a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            var xpathForConstatsClos = "//ELFIN[IDENTIFIANT/COMPTE='"+$scope.elfin.IDENTIFIANT.NOM+"'][(IDENTIFIANT/A) and not(IDENTIFIANT/A='')]";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: constatsCollectionId must come from server configuration resource.");
								            GeoxmlService.getCollection(constatsCollectionId).getList({"xpath" : xpathForConstatsClos})
												.then(function(elfins) {
														$scope.constatsClos = elfins;
													},
													function(response) {
														var message = "Le chargement des CONSTATs clos a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            
								            	}
							    		
							    	}, true);     
							    	
							    	$scope.$watch('elfin.IDENTIFIANT.OBJECTIF', function() { 

							    		if ($scope.elfin!=null) {
								            var xpathForPrestations = "//ELFIN[starts-with(IDENTIFIANT/OBJECTIF,'"+$scope.elfin.IDENTIFIANT.OBJECTIF+"')]";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: prestationCollectionId must come from server configuration resource.");
								            var prestationsCollectionId = 'G20081113902512302';
								            GeoxmlService.getCollection(prestationsCollectionId).getList({"xpath" : xpathForPrestations})
												.then(function(elfins) {
														$scope.prestations = elfins;
													},
													function(response) {
														var message = "Le chargement des PRESTATIONs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            
								            var xpathForContrats = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: contratsCollectionId must come from server configuration resource.");
								            var contratsCollectionId = 'G20081113902512301';
								            GeoxmlService.getCollection(contratsCollectionId).getList({"xpath" : xpathForContrats})
												.then(function(elfins) {
														$scope.contrats = elfins;
													},
													function(response) {
														var message = "Le chargement des CONTRATs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
							    	
							    		}
							    		
							    	}, true);
							    	
							    	$scope.$watch('elfin.Id', function() { 

							    		if ($scope.elfin!=null) {
								            
							    			// Get SURFACES
								            var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='"+$scope.elfin.Id+"']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: surfacesCollectionId must come from server configuration resource.");
								            var surfacesCollectionId = 'G20040930101030013';
								            GeoxmlService.getCollection(surfacesCollectionId).getList({"xpath" : xpathForSurfaces})
												.then(function(elfins) {
														$scope.surfaces = elfins;
													},
													function(response) {
														var message = "Le chargement des SURFACEs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            // Get Photo
								            for (var i = 0; i < $scope.elfin.ANNEXE.RENVOI.length; i++) {
												
								            	var currentRenvoi = $scope.elfin.ANNEXE.RENVOI[i];
												
												if ( currentRenvoi.VALUE.toLowerCase().indexOf("photo") != -1 ) {
													// Photo found build link
													var photoLink = currentRenvoi;
													$scope.photoSrc = '/api/melfin/annex/'+$scope.elfin.ID_G+"/"+$scope.elfin.Id+"/"+ $scope.getLienFileName(photoLink.LIEN);
													break;
												} else {
													// No photo found (other annex)
												}
											}
							    		};
							    		
							    	}, true);
							    	
							    	
							    	
							    	
						            var xpathForOwner = "//ELFIN[IDENTIFIANT/QUALITE='Propriétaire']";
						            // TODO: actorsCollectionId must come from server configuration resource.
						            $log.debug("TODO: ImmeubleCardController: actorsCollectionId must come from server configuration resource.");
						            var actorsCollectionId = 'G20060401225530100';
						            
						            // Asynchronous ownerActors pre-loading
						            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForOwner})
									.then(function(ownerActors) {
											$scope.ownerActors = ownerActors;
										},
										function(response) {
											var message = "Le chargement des ACTEURS Propriétaire a échoué (statut de retour: "+ response.status+ ")";
								            hbAlertMessages.addAlert("danger",message);
										});							    	
							    	
						            // Parameters to hbChooseOne service function for ACTOR selection
						            $scope.actorChooseOneColumnsDefinition = [
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];
						            $scope.actorChooseOneTemplate = '/assets/views/chooseActor.html';							    	
        
							    } ]);

})();
