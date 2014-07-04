(function() {

	angular.module('hb5').controller(
					'HbTransactionCardController',
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
							'userDetails',
							function($attrs, $scope, $rootScope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, HB_EVENTS, userDetails) {
					 			
								$log.debug("    >>>> Using HbTransactionCardController");

								$scope.displayBuildingAddress = function (noSai) {
									if ( (!$scope.selectedImmeuble) || ($scope.selectedImmeuble && $scope.selectedImmeuble.IDENTIFIANT.OBJECTIF != noSai) ) { 
										if ($scope.immeubles && $scope.immeubles.length > 0) {
											for (var i = 0; i < $scope.immeubles.length; i++) {
												var currImm = $scope.immeubles[i];
												if (currImm.IDENTIFIANT.OBJECTIF == noSai) {
													$scope.selectedImmeuble = currImm;
													break;
												}
											} 
										}
									} else {
										//$log.debug("    >>>> objectif BLUR No new SAI");
									}
//									if ($scope.selectedImmeuble) {
//										$log.debug("$scope.selectedImmeuble.IDENTIFIANT.ALIAS = " + $scope.selectedImmeuble.IDENTIFIANT.ALIAS);		
//									} else {
//										$log.debug("$scope.selectedImmeuble.IDENTIFIANT.ALIAS = undefined or null");
//									}
								 
					            };
								
					            $rootScope.$on(HB_EVENTS.ELFIN_CREATED, function(event, elfin) {

					            	// Update some catalogue properties with live data passed as route parameters 
					            	// while in create mode, following an HB_EVENTS.ELFIN_CREATED event. 
									if ( $attrs.hbMode === "create" ) {
										
										if ($scope.elfin) {
//									        $scope.buildingNb = $routeParams.nocons;
//									        $scope.saiNb = $routeParams.sai;
//									        $scope.elfin.IDENTIFIANT.OBJECTIF = $routeParams.sai;
//									        $scope.elfin.IDENTIFIANT.COMPTE = $routeParams.nocons;
											var currentDate = new Date();
									        $scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(currentDate);
									        $scope.elfin.IDENTIFIANT.PAR = currentDate.getFullYear().toString();
									        
									        // Default value from catalogue is not relevant
								        	$scope.elfin.IDENTIFIANT.QUALITE = "";
								        	// Get user abbreviation from userDetails service.
									        $scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation;	

									        // Default value from catalogue contains constatTypes list: Reset it.
									        $scope.elfin.GROUPE = "";
									        
										} else {
											$log.error("elfin should be available after HB_EVENTS.ELFIN_CREATED event notification.");
										}
									} else {
										// Do nothing
									}			            	
					            	
					            });		
							
								
					            // Asychronous TRANSACTION template preloading
					            GeoxmlService.getNewElfin("TRANSACTION").get()
					            .then(function(transaction) {
					            		// Get constat types from catalogue
					            		$scope.transactionTypes = hbUtil.buildArrayFromCatalogueDefault(transaction.GROUPE);

									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE CONSTAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});					            
					            
					            
								var focusOnGroupField = function() {
									$log.debug(">>>>>>>>>>>>>>>>>> FOCUS ON #objectif <<<<<<<<<<<<<<<<<<<<< ");
									$('#objectif').focus();
								};        
								
								// TODO: FocusTimeout issue. Find a better solution ? 
								$timeout(focusOnGroupField , 1000, true);
								
								
					            var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";
					            // TODO: immeublesCollectionId must come from server configuration resource.
					            $log.debug("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
					            var immeublesCollectionId = 'G20040930101030005';
					            
					            // Asychronous entrepriseActors preloading
					            GeoxmlService.getCollection(immeublesCollectionId).getList({"xpath" : xpathForImmeubles})
								.then(function(immeubles) {
										$scope.immeubles = immeubles;
										$log.debug(">>> IMMEUBLES: " + immeubles.length);
									},
									function(response) {
										var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "+ response.status+ ")";
							            hbAlertMessages.addAlert("danger",message);
									});								
								
					            $scope.immeubleChooseOneColumnsDefinition = [{ field:"PARTENAIRE.PROPRIETAIRE.VALUE", displayName: "Propriétaire"},
					                        		   		          { field:"IDENTIFIANT.OBJECTIF", displayName: "Numéro de gérance"},
					                        		   		          { field:"CARACTERISTIQUE.CARSET.CAR[0].VALEUR", displayName: "Lieu-dit"}
					                        		   		          ];
					            $scope.immeubleChooseOneTemplate = '/assets/views/chooseOneImmeuble.html';
					            
							} ]);

})();
