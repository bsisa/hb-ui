(function() {

	    angular
			.module('hb5')
			.controller(
					'HbImmeubleCardController',
					[
							'$scope',
							'$rootScope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							'HB_EVENTS',
							'HB_API',
							function($scope, $rootScope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout, hbAlertMessages,
									hbUtil, HB_EVENTS, HB_API) {
    
									$log.debug("    >>>> Using HbImmeubleCardController");
									
									// Owner Actor (ACTEUR role=Propriétaire)  linked to the current building.
									$scope.selected = { "owner" : null , "ownerDisplay" : null};
									
							        $scope.constatsEncours = null;
							        $scope.constatsClos = null;
							        $scope.prestations = null;
							        $scope.surfaces = null;
							    	
						            $scope.locUnitPredicate = 'IDENTIFIANT.DE';
						            $scope.locUnitReverse = true;		
						            
						            $scope.prestaPredicate = 'IDENTIFIANT.DE';
						            $scope.prestaReverse = true;
						            
						            $scope.contractPredicate = 'PARTENAIRE.FOURNISSEUR.VALUE';
						            $scope.contractReverse = false;
							        
							        
									// Triggers a redirection to the CONSTAT creation URL with current 
									// IMMEUBLE building number and SAI number passed as parameters.
									$scope.createNewConstat = function() {
										var searchObj = {nocons: $scope.elfin.IDENTIFIANT.NOM, sai: $scope.elfin.IDENTIFIANT.OBJECTIF}
										$location.search(searchObj).path( "/elfin/create/CONSTAT" );	
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
							    			// TODO: add restriction on PROPRIETAIRE
								            var xpathForPrestations = "//ELFIN[starts-with(IDENTIFIANT/OBJECTIF,'"+$scope.elfin.IDENTIFIANT.OBJECTIF+"') and PARTENAIRE/PROPRIETAIRE/@NOM='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM+"']";
							    			//var xpathForPrestations = "//ELFIN[starts-with(IDENTIFIANT/OBJECTIF,'"+$scope.elfin.IDENTIFIANT.OBJECTIF+"')]";
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
							    	
							    	// Check when elfin instance becomes available 
							    	$scope.$watch('elfin.Id', function() { 

							    		if ($scope.elfin!=null) {
								            
							    			// Data correction - if no elfin.PARTENAIRE.FOURNISSEUR.VALUE datastructure exist creates it
							    			// TODO: evaluate batch data update. 
							    			if (!$scope.elfin.PARTENAIRE.FOURNISSEUR) {
							    				$log.debug("No elfin.PARTENAIRE.FOURNISSEUR data structure found, create it.");
							    				$scope.elfin.PARTENAIRE.FOURNISSEUR = {"Id":"null","ID_G":"null","NOM":"null","GROUPE":"null","VALUE":"-"};
							    				$scope.elfinForm.$setDirty();
							    			}
							    			
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
								            // Make IMMEUBLE photo available
								            $scope.updatePhotoSrc();
							    		};
							    		
							    	}, true);
							    	
							    	
							    	// ============================================================================
							    	// === Manage owner link 
							    	// ============================================================================							    	
							    	
									// Owner actor linked to building 
							        $scope.getElfinOwnerActor = function (collectionId, elfinId) {
							        	
								        GeoxmlService.getElfin(collectionId, elfinId).get()
								        .then(function(elfin) {
								        	// Force CAR array sorting by POS attribute
								        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
								        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
								        	//       Need review of other similar operations
								        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
								        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
								        	}
								        	$log.debug(">>>>>>>>>>>> ownerActor.Id = " + elfin.Id);
								        	$scope.selected.owner = elfin;
								        	$scope.selected.ownerDisplay = $scope.selected.owner.IDENTIFIANT.NOM + " - " + $scope.selected.owner.GROUPE;
								        	}, function(response) {
								        	var message = "Le chargement du propriétaire lié à l'immeuble no gérance "+$scope.elfin.IDENTIFIANT.OBJECTIF+" a échoué (statut de retour: " + response.status + ")";
								            hbAlertMessages.addAlert("danger",message);
								        });
						        		
						        	};							    	
							    	

						            // Load ELFIN owner ACTOR only once main elfin (here IMMEUBLE) has been loaded
						            $rootScope.$on(HB_EVENTS.ELFIN_LOADED, function(event, elfin) {
						            	
						            	$log.debug(">>>> HbImmeubleCardController: HB_EVENTS.ELFIN_LOADED for elfin.Id = " + elfin.Id);
						            	
						            	// Make sure a valid owner reference exists before loading
								        if ( 
								        		$scope.elfin.PARTENAIRE && 
								        		$scope.elfin.PARTENAIRE.PROPRIETAIRE && 
								        		$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id && 
								        		(elfin.PARTENAIRE.PROPRIETAIRE.Id != 'null') &&
								        		$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G && 
								        		(elfin.PARTENAIRE.PROPRIETAIRE.ID_G != 'null')) {							        		
							        		
							        		$log.debug(">>>> HbImmeubleCardController: loading ELFIN owner Actor Id = " + elfin.PARTENAIRE.PROPRIETAIRE.Id + ", ID_G = " + elfin.PARTENAIRE.PROPRIETAIRE.ID_G);
							        		$scope.getElfinOwnerActor(elfin.PARTENAIRE.PROPRIETAIRE.ID_G, elfin.PARTENAIRE.PROPRIETAIRE.Id);	
							        	}			            	

						            });			        	
						        	
						            
						            /**
						             * Update current IMMEUBLE link to owner ACTOR upon new owner ACTOR selection
						             */
						            $scope.$watch('selected.owner.Id', function(newId, oldId) {
						            	
						            	if ( newId && $scope.elfin && ($scope.elfin.PARTENAIRE.PROPRIETAIRE.Id != $scope.selected.owner.Id) ) {

						            		$scope.selected.ownerDisplay = $scope.selected.owner.IDENTIFIANT.NOM + " - " + $scope.selected.owner.GROUPE;
						            		
							            	// Update the new ACTOR ids
							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G = $scope.selected.owner.ID_G;
							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id = $scope.selected.owner.Id;
							            	// According to the GeoXML Schema GROUP and NOM are part of PROPRIETAIRE.
							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.GROUPE = $scope.selected.owner.GROUPE;
							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM = $scope.selected.owner.IDENTIFIANT.NOM;
							            	// Reset VALUE which should no more be used.
							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE = "";
							            	// Notify the user the data need saving.
							            	$scope.elfinForm.$setDirty();			            		
						            	}

						            });
						            
							    	// ============================================================================

							    } ]);

})();
