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
							'hbQueryService',
							'userDetails',
							'HB_EVENTS',
							'HB_API',
							'HB_ROLE_FONCTION',
							function($attrs, $scope, $rootScope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout, hbAlertMessages,
									hbUtil, hbQueryService, userDetails, HB_EVENTS, HB_API, HB_ROLE_FONCTION) {
    
									$log.debug("    >>>> Using HbImmeubleCardController");
									
									// Wait for the owner actor to have a chance to load before displaying annoying validation error.
									//$scope.validateOwner = false;									
									
									// Expose current hbMode in scope for use by ng-show in HTML view.
									$scope.createMode = ($attrs.hbMode === "create");
									// Manage FONCTION level access rights
									$scope.canEdit = ($scope.createMode || _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.BUILDING_EDIT));
									$scope.canEditParteners = ($scope.createMode || $scope.canEdit || _.contains(userDetails.getRoles(), HB_ROLE_FONCTION.BUILDING_EDIT_OTHER_PARTNERS));
									
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
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: prestationCollectionId must come from server configuration resource.");
							    			// DONE: added restriction on PROPRIETAIRE, CLASSE. Strict restriction on OBJECTIF, starts-with is not correct in all cases.
								            var xpathForPrestations = "//ELFIN[substring-before(IDENTIFIANT/OBJECTIF,'.')='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"' and PARTENAIRE/PROPRIETAIRE/@NOM='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM+"' and @CLASSE='PRESTATION']";
								            hbQueryService.getPrestations(xpathForPrestations)
												.then(function(elfins) {
														$scope.prestations = elfins;
													},
													function(response) {
														var message = "Le chargement des PRESTATIONs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            
								            var xpathForContrats = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"']";
								            hbQueryService.getContrats(xpathForContrats)
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
							    			
							    			// Get UNITE_LOCATIVE corresponding to current ELFIN.Id
								            var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='"+$scope.elfin.Id+"']";
								            hbQueryService.getLocationUnits(xpathForSurfaces)
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

									/**
									 * Remove an existing `other partner`
									 */
									$scope.removeOtherPartner = function(index) {
										
										if ($scope.elfin.CARACTERISTIQUE) {
											if ($scope.elfin.CARACTERISTIQUE.FRACTION) {
												if ($scope.elfin.CARACTERISTIQUE.FRACTION.L) {
													// Remove one element at index
													$scope.elfin.CARACTERISTIQUE.FRACTION.L.splice(index,1);
													// Allow user saving the new data structure following above element deletion
													$scope.elfinForm.$setDirty();
													// Deal with POS numbering.
													GeoxmlService.renumberPos($scope.elfin.CARACTERISTIQUE.FRACTION.L);
												}
											}
										}
									};
									
									
									
							    } ]);

})();
