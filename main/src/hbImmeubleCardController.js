(function() {
	
	    angular
			.module('hb5')
			.controller(
					'HbImmeubleCardController',
					[
					 		'$attrs',				 
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
							function($attrs, $scope, $rootScope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout, hbAlertMessages,
									hbUtil, HB_EVENTS, HB_API) {
    
									$log.debug("    >>>> Using HbImmeubleCardController");
									
									// Wait for the owner actor to have a chance to load before displaying annoying validation error.
									//$scope.validateOwner = false;									
									
									// Expose current hbMode in scope for use by ng-show in HTML view.
									$scope.createMode = ($attrs.hbMode === "create");
									
									// Owner Actor (ACTEUR role=Propriétaire)  linked to the current building.
									//$scope.selected = { "owner" : null , "ownerDisplay" : null};
									
							        $scope.constatsEncours = null;
							        $scope.constatsClos = null;
							        $scope.prestations = null;
							        $scope.locationUnits = null;
							    	
						            $scope.locUnitPredicate = 'IDENTIFIANT.DE';
						            $scope.locUnitReverse = true;		
						            
						            $scope.prestaPredicate = 'IDENTIFIANT.DE';
						            $scope.prestaReverse = true;
						            
						            $scope.contractPredicate = 'PARTENAIRE.FOURNISSEUR.VALUE';
						            $scope.contractReverse = false;
							        
							        
									/**
									 * Triggers a redirection to the CONSTAT creation URL with current
									 * IMMEUBLE building number and SAI number passed as parameters.
									 * Must not be effective while in create mode (no association is 
									 * relevant while the IMMEUBLE creation is ongoing/pending.)
									 */ 
									$scope.createNewConstat = function() {
										if ($attrs.hbMode != "create") {
											var searchObj = {nocons: $scope.elfin.IDENTIFIANT.NOM, sai: $scope.elfin.IDENTIFIANT.OBJECTIF}
											$location.search(searchObj).path( "/elfin/create/CONSTAT" );
										}
									};									
									
							    	/**
							    	 * Listener used to load CONSTAT list related to this IMMEUBLE
							    	 * Only relevant while not in create mode.
							    	 */
							    	$scope.$watch('elfin.IDENTIFIANT.NOM', function() { 

							    		if ($scope.elfin!=null && $attrs.hbMode != "create") {
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
							    	
							    	/**
							    	 * Listener used to load PRESTATION, CONTRAT lists related to this IMMEUBLE 
							    	 * Only relevant while not in create mode.
							    	 */
							    	$scope.$watchCollection('[elfin.IDENTIFIANT.OBJECTIF,elfin.PARTENAIRE.PROPRIETAIRE.NOM]', function(newValues, oldValues) {							    		

							    		$log.debug("$watchCollection for OBJECTIF, PROPRIETAIRE.NOM : " + oldValues[0] + ", " + oldValues[1] + " => " + newValues[0] + ", " + newValues[1]);
							    		
							    		if ($scope.elfin!=null && $attrs.hbMode != "create") {
							    			// DONE: added restriction on PROPRIETAIRE, CLASSE. Strict restriction on OBJECTIF, starts-with is not correct in all cases.
								            var xpathForPrestations = "//ELFIN[substring-before(IDENTIFIANT/OBJECTIF,'.')='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"' and PARTENAIRE/PROPRIETAIRE/@NOM='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM+"' and @CLASSE='PRESTATION']";

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
								            
							    			/**
							    			 * Perform template clean up tasks while in create mode.
							    			 */
								    		if ($attrs.hbMode === "create") {
								    			$scope.elfin.IDENTIFIANT.NOM = '';
								    			$scope.elfin.IDENTIFIANT.OBJECTIF = '';
								    			$scope.elfin.IDENTIFIANT.QUALITE = '';
								    			$scope.elfin.IDENTIFIANT.COMPTE = '';
								    			$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM = '';
								    			$scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE = '';
								    			$scope.elfin.CARACTERISTIQUE.CAR2.VALEUR = '';
								    		} 
							    			// Data correction - if no elfin.PARTENAIRE.FOURNISSEUR.VALUE datastructure exist creates it
							    			// TODO: evaluate batch data update. 
							    			if (!$scope.elfin.PARTENAIRE.FOURNISSEUR) {
							    				$log.debug("No elfin.PARTENAIRE.FOURNISSEUR data structure found, create it.");
							    				$scope.elfin.PARTENAIRE.FOURNISSEUR = {"Id":"null","ID_G":"null","NOM":"null","GROUPE":"null","VALUE":"-"};
							    				$scope.elfinForm.$setDirty();
							    			}
							    			
							    			// Manage IMMEUBLE PARTENAIRE.PROPRIETAIRE owner link initialisation 
//							            	if ( 
//									        		$scope.elfin.PARTENAIRE && 
//									        		$scope.elfin.PARTENAIRE.PROPRIETAIRE && 
//									        		$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id && 
//									        		($scope.elfin.PARTENAIRE.PROPRIETAIRE.Id != 'null') &&
//									        		$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G && 
//									        		($scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G != 'null')) {							        		
//								        		
//								        		$log.debug(">>>> HbImmeubleCardController: loading IMMEUBLE owner Actor Id = " + $scope.elfin.PARTENAIRE.PROPRIETAIRE.Id + ", ID_G = " + $scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G);
//								        		$scope.getElfinOwnerActor($scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G, $scope.elfin.PARTENAIRE.PROPRIETAIRE.Id);
//								        	} else {
//								        		$scope.enableValidateOwner();
//								        	}									    			
							    			
							    			// Get UNITE_LOCATIVE by corresponding to current ELFIN.Id
								            var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='"+$scope.elfin.Id+"']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: locationUnitsCollectionId must come from server configuration resource.");
								            var locationUnitsCollectionId = 'G20040930101030013';
								            GeoxmlService.getCollection(locationUnitsCollectionId).getList({"xpath" : xpathForSurfaces})
												.then(function(elfins) {
														$scope.locationUnits = elfins;
													},
													function(response) {
														var message = "Le chargement des SURFACEs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            // Make IMMEUBLE photo available
								            $scope.updatePhotoSrc();
							    		};
							    		
							    	}, true);
							    	
							    	
									/**
									 * Add other partner as: CARACTERISTIQUE.FRACTION.L.{
									 * [
									 *  C = ??? ,
									 *  C = Actor.ID_G,
									 *  C = Actor.Id,
									 *  C = Actor.GROUPE,
									 *  C = Actor.NOM
									 *  ]
									 * }
									 */
									$scope.addOtherPartner = function() {
										
										var emptyFractionTemplate = { "L": [  ] };
										var actorCellTemplate = { "C": [ 
										                               { "POS": 1, "VALUE": ""},
										                               { "POS": 2, "VALUE": ""},
										                               { "POS": 3, "VALUE": ""},
										                               { "POS": 4, "VALUE": ""},
										                               { "POS": 5, "VALUE": ""}
										                               ]
																		,
																"POS": 1 };
										
										if ($scope.elfin.CARACTERISTIQUE) {
											if ($scope.elfin.CARACTERISTIQUE.FRACTION) {
												if ($scope.elfin.CARACTERISTIQUE.FRACTION.L) {
													actorCellTemplate.POS = $scope.elfin.CARACTERISTIQUE.FRACTION.L.length+1;
													$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', actorCellTemplate);
												} else {
													// FRACTION with no lines
													$scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
													$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', actorCellTemplate);
												}
											} else {
												// Missing properties are created automatically in JS, thus same code as for empty FRACTION.
												$scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
												$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', actorCellTemplate);									
											}
										} else {
											// always available in catalogue
										}
									};
									// elfin.CARACTERISTIQUE.FRACTION.L							    	
							    	
									// enables Owner actor validation with a delay.
//									$scope.enableValidateOwner = function() {
//										$timeout(function(){
//											$scope.validateOwner = true;
//										}, 2000, true);
//									};
							    	
							    	// ============================================================================
							    	// === Manage owner link 
							    	// ============================================================================							    	
							    	
									// Owner actor linked to building 
//							        $scope.getElfinOwnerActor = function (collectionId, elfinId) {
//							        	
//								        GeoxmlService.getElfin(collectionId, elfinId).get()
//								        .then(function(elfin) {
//								        	// Force CAR array sorting by POS attribute
//								        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
//								        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
//								        	//       Need review of other similar operations
//								        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
//								        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
//								        	}
//								        	$log.debug(">>>>>>>>>>>> ownerActor.Id = " + elfin.Id);
//								        	$scope.selected.owner = elfin;
//								        	$scope.selected.ownerDisplay = $scope.selected.owner.IDENTIFIANT.NOM + " - " + $scope.selected.owner.GROUPE;
//
//								            // Enable validation the current status should be ok.
//								        	$scope.enableValidateOwner();
//								        	
//								        	}, function(response) {
//								        	var message = "Le chargement du propriétaire lié à l'immeuble no gérance "+$scope.elfin.IDENTIFIANT.OBJECTIF+" a échoué (statut de retour: " + response.status + ")";
//								            hbAlertMessages.addAlert("danger",message);
//								            // Enable validation to show the problem
//								            $scope.enableValidateOwner();
//								        });
//						        		
//						        	};							    	
							    	
//						            /**
//						             * Update current IMMEUBLE link to owner ACTOR upon new owner ACTOR selection
//						             */
//						            $scope.$watch('selected.owner.Id', function(newId, oldId) {
//						            	
//						            	if ( newId && $scope.elfin && ($scope.elfin.PARTENAIRE.PROPRIETAIRE.Id != $scope.selected.owner.Id) ) {
//
//						            		$scope.selected.ownerDisplay = $scope.selected.owner.IDENTIFIANT.NOM + " - " + $scope.selected.owner.GROUPE;
//						            		
//							            	// Update the new ACTOR ids
//							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G = $scope.selected.owner.ID_G;
//							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id = $scope.selected.owner.Id;
//							            	// According to the GeoXML Schema GROUP and NOM are part of PROPRIETAIRE.
//							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.GROUPE = $scope.selected.owner.GROUPE;
//							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM = $scope.selected.owner.IDENTIFIANT.NOM;
//							            	// Reset VALUE which should no more be used.
//							            	$scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE = "";
//							            	// Notify the user the data need saving.
//							            	$scope.elfinForm.$setDirty();			            		
//						            	}
//
//						            });
						            
							    	// ============================================================================

							    } ]);

})();
