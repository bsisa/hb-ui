(function() {
	
	    angular
			.module('hb5')
			.controller(
					'HbAmenagementSportifCardController',
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
							'$filter',
							'$locale',
							'hbAlertMessages',
							'hbUtil',
							'hbQueryService',
							'userDetails',
							'HB_EVENTS',
							'HB_API',
							'HB_ROLE_FONCTION',
							'hbTabCacheService',
							function($attrs, $scope, $rootScope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout, $filter,  $locale, hbAlertMessages,
									hbUtil, hbQueryService, userDetails, HB_EVENTS, HB_API, HB_ROLE_FONCTION, hbTabCacheService) {
    
									//$log.debug("    >>>> Using HbAmenagementSportifCardController with $locale.id = " + $locale.id);
					 			
					 				/**
					 				 *  Expose hbUtil.getCByPos function to scope.
					 				 */
					 				$scope.getCByPos = function(Cs, CPos) {
					 					return hbUtil.getCByPos(Cs, CPos);
					 				};
					 			

                                    // ================= Tab state management - start =============
					 				/**
					 				 * Check parent controller and hbTabStateService for complete overview.
					 				 */
					 				var cachedTab = hbTabCacheService.getTabState($location.absUrl());
					 				
					 				/** Create tabState object if not already available in cache,
					 				 */
					 				if (cachedTab === undefined) {
					 					$scope.tabState = { 
						 						"amenagement_sportif" : { "active" : true },
						 						"buildings" : { "active" : false }, 
						 						"prestation" : { "active" : false },
						 						"prestation_subtab_annee_moins1" : { "active" : true },
						 						"prestation_subtab_annee_plus1" : { "active" : false },
						 						"prestation_subtab_toutes" : { "active" : false },
						 						"contrat" : { "active" : false },
						 						"contrat_subtab_actifs" : { "active" : true },
						 						"contrat_subtab_denonces" : { "active" : false },
						 						"contrat_subtab_tous" : { "active" : false },
						 						"caracteristique" : { "active" : false },
						 						"valeur" : { "active" : false },
						 						"installations_sportives" : { "active" : false },
						 						"forme" : { "active" : false },
						 						"annexe" : { "active" : false }
						 				};
					 				} else {
					 					$scope.tabState = cachedTab;
					 				}
				 					/**
				 					 * Link to $parent scope tabState reference.
				 					 */
					 				$scope.$parent.tabState = $scope.tabState;
                                    // ================= Tab state management - end ===============
					 				
									// Wait for the owner actor to have a chance to load before displaying annoying validation error.
									//$scope.validateOwner = false;		
									$scope.annexeFileSystemUri = "";
									
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
							        
							        // Array containing list of installations sportives.
							        // TODO
							        
							        var currentYear = moment().year();
							        var lastYear = currentYear - 1;
							        var nextYear = currentYear + 1;
							        $scope.currentYearAndFormerPrestationSearch = {
											"group" : "",
											"origin" : "",
											"account" : "",
											"goal" : "",
											"from" :  lastYear+"|"+currentYear,
											"replacementValue" : "",
											"manager" : "",
											"owner" : "",
											"remark" : ""
										};
							        $scope.nextYearPrestationSearch = {
											"group" : "",
											"origin" : "",
											"account" : "",
											"goal" : "",
											"from" :  nextYear.toString(),
											"replacementValue" : "",
											"manager" : "",
											"owner" : "",
											"remark" : ""
										};
							        
							        $scope.locationUnits = null;
							    	
						            $scope.locUnitPredicate = 'IDENTIFIANT.DE';
						            $scope.locUnitReverse = true;		
						            
						            $scope.locationUnitsArchived = null;
						            
						            $scope.locUnitArchivedPredicate = 'IDENTIFIANT.DE';
						            $scope.locUnitArchivedReverse = true;			
						            
						            
						            //$scope.prestaPredicate = 'IDENTIFIANT.DE';
						            $scope.prestaPredicate = ['-IDENTIFIANT.DE','GROUPE','DIVERS.REMARQUE'];
						            //$scope.prestaReverse = true;
						            
						            $scope.contractPredicate = 'PARTENAIRE.FOURNISSEUR.VALUE';
						            $scope.contractReverse = false;
							        
							        
									/**
									 * Triggers a redirection to the CONSTAT creation URL with current
									 * AMENAGEMENT_SPORTIF building number and SAI number passed as parameters.
									 * Must not be effective while in create mode (no association is 
									 * relevant while the AMENAGEMENT_SPORTIF creation is ongoing/pending.)
									 */ 
									$scope.createNewConstat = function() {										
										if ($attrs.hbMode != "create") {
//											var searchObj = {nocons: $scope.elfin.IDENTIFIANT.NOM, sai: $scope.elfin.IDENTIFIANT.OBJECTIF}
									        // Added id,classe,idg for generic link to creation source/parent prototype - done for SSPO.
											var searchObj = {nocons: $scope.elfin.IDENTIFIANT.NOM, sai: $scope.elfin.IDENTIFIANT.OBJECTIF, id: $scope.elfin.Id, classe: $scope.elfin.CLASSE, idg: $scope.elfin.ID_G }
											$location.search(searchObj).path( "/elfin/create/CONSTAT" );
										}
									};
									
									
									/**
									 * Triggers a redirection to the PRESTATION creation URL with current
									 * AMENAGEMENT_SPORTIF Id and ID_G passed as parameters.
									 * Must not be effective while in create mode (no association is 
									 * relevant while the AMENAGEMENT_SPORTIF creation is ongoing/pending.)
									 */ 
									$scope.createNewPrestation = function() {
										if ($attrs.hbMode != "create") {
											var searchObj = {Id: $scope.elfin.Id, ID_G: $scope.elfin.ID_G}
											$location.search(searchObj).path( "/elfin/create/PRESTATION" );
										}
									};
									
									
									/**
									 * Triggers a redirection to the CONTRAT creation URL with current
									 * AMENAGEMENT_SPORTIF SAI number passed as parameter.
									 * Must not be effective while in create mode (no association is 
									 * relevant while the AMENAGEMENT_SPORTIF creation is ongoing/pending.)
									 */ 
									$scope.createNewContract = function() {
										if ($attrs.hbMode != "create") {
											var searchObj = {sai: $scope.elfin.IDENTIFIANT.OBJECTIF}
											$location.search(searchObj).path( "/elfin/create/CONTRAT" );
										}
									};			
									
									
									
							    	/**
							    	 * Listener used to load CONSTAT list related to this AMENAGEMENT_SPORTIF
							    	 * Only relevant while not in create mode.
							    	 */
							    	$scope.$watch('elfin.IDENTIFIANT.NOM', function() { 

							    		if ($scope.elfin!=null && $attrs.hbMode != "create") {
								            var xpathForConstatsEncours = "//ELFIN[IDENTIFIANT/COMPTE='"+$scope.elfin.IDENTIFIANT.NOM+"'][not(IDENTIFIANT/A) or IDENTIFIANT/A='']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            //$log.debug("TODO: HbAMENAGEMENT_SPORTIFCardController: constatsCollectionId must come from server configuration resource.");
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
								            //$log.debug("TODO: HbAMENAGEMENT_SPORTIFCardController: constatsCollectionId must come from server configuration resource.");
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
							    	 * Listener used to load PRESTATION, CONTRAT lists related to this AMENAGEMENT_SPORTIF 
							    	 * Only relevant while not in create mode.
							    	 */
							    	$scope.$watchCollection('[elfin.IDENTIFIANT.OBJECTIF,elfin.PARTENAIRE.PROPRIETAIRE.NOM]', function(newValues, oldValues) {							    		

							    		//$log.debug("$watchCollection for OBJECTIF, PROPRIETAIRE.NOM : " + oldValues[0] + ", " + oldValues[1] + " => " + newValues[0] + ", " + newValues[1]);
							    		
							    		if ($scope.elfin!=null && $attrs.hbMode != "create") {
								            // TODO: constatsCollectionId must come from server configuration resource.
							    			//$log.debug("TODO: HbAMENAGEMENT_SPORTIFCardController: prestationCollectionId must come from server configuration resource.");
							    			// DONE: added restriction on PROPRIETAIRE, CLASSE. Strict restriction on OBJECTIF, starts-with is not correct in all cases.
								            var xpathForPrestations = "//ELFIN[substring-before(IDENTIFIANT/OBJECTIF,'.')='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"' and PARTENAIRE/PROPRIETAIRE/@NOM='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM+"' and @CLASSE='PRESTATION']";
								            // TODO: evaluate replacing the above by the following.
								            //$log.debug(">>>> amenagement_sportif: xpathForPrestations = " + xpathForPrestations)
								            //var xpathForPrestations = "//ELFIN[substring-before(IDENTIFIANT/OBJECTIF,'.')='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"' and PARTENAIRE/PROPRIETAIRE/@Id='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id+"' and PARTENAIRE/PROPRIETAIRE/@ID_G='"+$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G+"' and @CLASSE='PRESTATION']";
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
							    	
		    	
							    	/**
							    	 * Helper function to link and if necessary create CAR elements by position. 
							    	 */
							    	var linkCARByPos = function(pos) {
							    		// Link CAR by pos to currentCAR variable. If not found currentCAR === undefined
							    		var currentCAR = hbUtil.getCARByPos($scope.elfin,pos);
							    		// If currentCAR undefined
							    		if (!currentCAR) {
							    			// Create missing CAR for position pos
							    			//$log.debug(">>>> Create missing CAR for position pos = " + pos);
							    			$scope.elfin.CARACTERISTIQUE.CARSET.CAR.splice(pos-1, 0, {"VALEUR":"","POS":pos});
							    			// Link newly created CAR by pos to currentCAR variable
							    			currentCAR = hbUtil.getCARByPos($scope.elfin,pos);
							    		}
							    		return currentCAR;
							    	};
							    	
							    	// Check when elfin instance becomes available 
							    	$scope.$watch('elfin.Id', function() { 
							    		
							    		if ($scope.elfin!=null) {
								            
							    			// Asychronous AMENAGEMENT_SPORTIF template preloading
								            GeoxmlService.getNewElfin("AMENAGEMENT_SPORTIF").get()
								            .then(function(amenagementSportifTemplate) {
								            		// Get list from catalogue default
								            		$scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(amenagementSportifTemplate.GROUPE);
												},
												function(response) {
													var message = "Les valeurs par défaut pour la CLASSE AMENAGEMENT_SPORTIF n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
													hbAlertMessages.addAlert("danger",message);
												});								    			
							    			
											// ===========================================================
											// Safe access to elfin.CARACTERISTIQUE.CARSET.CAR by POS 
							    			// Relying on Js array position is not a safe option when 
							    			// POS indexes are discontinuous. (i.e. POS="4" missing)
							    			// JS misses XPath like: 
							    			// 		ELFIN/CARACTERISTIQUE/CARSET/CAR[@POS='6']
							    			// Hereafter using underscore.js to perform reference mapping
											// ===========================================================

							    			// Lieu-dit
							    			$scope.CARSET_CAR_POS_1 = linkCARByPos(1);
							    			// Unused (empty) 
							    			$scope.CARSET_CAR_POS_2 = linkCARByPos(2);
							    			// No ECAP
							    			$scope.CARSET_CAR_POS_3 = linkCARByPos(3);
							    			// Unused (empty) 
							    			$scope.CARSET_CAR_POS_4 = linkCARByPos(4);
							    			// Valeur ECAP
											$scope.CARSET_CAR_POS_5 = linkCARByPos(5);
											// Année estimation ECAP
											$scope.CARSET_CAR_POS_6 = linkCARByPos(6);
											// Valeur cadastrale
											$scope.CARSET_CAR_POS_7 = linkCARByPos(7);
											// Année estimation cadastrale
											$scope.CARSET_CAR_POS_8 = linkCARByPos(8);
											// Nombre de classe
											$scope.CARSET_CAR_POS_9 = linkCARByPos(9);
											// Nombre de place de travail
											$scope.CARSET_CAR_POS_10 = linkCARByPos(10);

											// ===========================================================							    			

							    			/**
							    			 * Perform template clean up tasks while in create mode.
							    			 * TODO: review for AMENAGEMENT_SPORTIF.
							    			 */
								    		if ($attrs.hbMode === "create") {
								    			
								    			$scope.elfin.GROUPE = '';
								    			
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

							    			// Links to buildings - Process selectionImmeuble if available
											if ($routeParams.selectionImmeuble) {
							 					$log.debug("$routeParams.selectionImmeuble = " + $routeParams.selectionImmeuble);
							 					var selectionImmeubleStrSplit = $routeParams.selectionImmeuble.split('/');
							 					$scope.selectionImmeuble = {
							 						"ID_G" : selectionImmeubleStrSplit[0],
							 						"CLASSE" : selectionImmeubleStrSplit[1],
							 						"Id" : selectionImmeubleStrSplit[2]
							 					}
							 					$scope.addBuilding($scope.selectionImmeuble);
							 				}									
							    			
							    			// Current time in text format
								            var currentHbTextDate = hbUtil.getDateInHbTextFormat(new Date());							    			
							    			
								            
								            // Make AMENAGEMENT_SPORTIF photo available
								            $scope.updatePhotoSrc();
								            
								            // Update path to local file system
								            var fsURI = hbUtil.buildAnnexeFileSystemUri($scope.elfin);
								            //$log.debug(">>>> fsURI = " + fsURI);
								            $scope.annexeFileSystemUri = fsURI;
								            
							    		};
							    		
							    	}, true);
							    	
							    	
									/**
									 * Add other partner as: CARACTERISTIQUE.FRACTION.L.{
									 * [
									 *  C = Actor CLASSE = 'ACTEUR' , (Information used by fractionElfinRefFilter in SSPO ctxt.)
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
										                               { "POS": 1, "VALUE": "ACTEUR"},
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
									
									
									
									/**
									 * Add IMMEUBLE linked to this AMENAGEMENT_SPORTIF as: CARACTERISTIQUE.FRACTION.L.{
									 * [
									 *  C = 'IMMEUBLE' , (CLASSE information)
 									 *  C = Building.ID_G,
									 *  C = Building.Id,
									 *  C = Building.GROUPE,
									 *  C = Building.NOM
									 *  ]
									 * }
									 */
									$scope.addBuilding = function(buildingSelection) {
										
										$log.debug(">>>> addBuilding for buildingSelection = " + buildingSelection);
										$log.debug(">>>> $scope.elfin.CARACTERISTIQUE.FRACTION.L before = " + angular.toJson($scope.elfin.CARACTERISTIQUE.FRACTION.L) );
										
										
										var emptyFractionTemplate = { "L": [  ] };
										var buildingCellTemplate = { "C": [ 
										                               { "POS": 1, "VALUE": buildingSelection.CLASSE},
										                               { "POS": 2, "VALUE": buildingSelection.ID_G},
										                               { "POS": 3, "VALUE": buildingSelection.Id},
										                               { "POS": 4, "VALUE": ""},
										                               { "POS": 5, "VALUE": ""}
										                               ]
																		,
																"POS": 1 };
										
										if ($scope.elfin.CARACTERISTIQUE) {
											if ($scope.elfin.CARACTERISTIQUE.FRACTION) {
												if ($scope.elfin.CARACTERISTIQUE.FRACTION.L) {
													// Do not add a duplicate reference
													var isDuplicateRef = false;
													angular.forEach($scope.elfin.CARACTERISTIQUE.FRACTION.L, function (fractionL) {
									                    if ( hbUtil.getCByPos(fractionL.C, 2).VALUE === buildingSelection.ID_G && hbUtil.getCByPos(fractionL.C, 3).VALUE === buildingSelection.Id ) {
									                    	$log.debug("Duplicate reference for : " + buildingSelection.CLASSE + " " + buildingSelection.ID_G+ "/" +buildingSelection.Id);
									                    	isDuplicateRef = true;
									                    }
									                });													
													if (!isDuplicateRef) {
														buildingCellTemplate.POS = $scope.elfin.CARACTERISTIQUE.FRACTION.L.length+1;
														$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', buildingCellTemplate);
														// Allow user saving the new data structure following above element insertion
														$scope.elfinForm.$setDirty();														
													} else {
										            	var message = "Opération annuléé - L'objet " + buildingSelection.CLASSE + " - " + buildingSelection.ID_G + "/" + buildingSelection.Id + " fait déjà partie de votre liste d'" + buildingSelection.CLASSE +"s";
										   				hbAlertMessages.addAlert("warning",message);
													}											
												} else {
													// FRACTION with no lines
													$scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
													$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', buildingCellTemplate);
													// Allow user saving the new data structure following above element insertion
													$scope.elfinForm.$setDirty();
												}
											} else {
												// Missing properties are created automatically in JS, thus same code as for empty FRACTION.
												$scope.elfin.CARACTERISTIQUE.FRACTION = emptyFractionTemplate;
												$scope.addRow($scope.elfin, 'CARACTERISTIQUE.FRACTION.L', buildingCellTemplate);
												// Allow user saving the new data structure following above element insertion
												$scope.elfinForm.$setDirty();
											}
										} else {
											// always available in catalogue
										}
										
										$log.debug(">>>> $scope.elfin.CARACTERISTIQUE.FRACTION.L after = " + angular.toJson($scope.elfin.CARACTERISTIQUE.FRACTION.L) );
										
									};
						    	

									/**
									 * Remove an existing `building reference`
									 */
									$scope.removeBuilding = function(index) {
										
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
