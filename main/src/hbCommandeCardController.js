(function() {

	angular
			.module('hb5')
			.controller(
					'HbCommandeCardController',
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
							'hbQueryService',
							function($attrs, $scope, $rootScope, GeoxmlService,
									$modal, $routeParams, $location, $log,
									$timeout, hbAlertMessages, hbUtil,
									HB_EVENTS, userDetails, hbQueryService) {

						
								$scope.selected = { 
										"building" : {},
										"owner" : {},
										"initialised" : false
									};
								
								
								$scope.$watch('selected.building', function(newBuilding, oldBuilding) { 
									if ($scope.selected.initialised === true ) {
										if ($scope.selected.building) {
											$log.debug("building : " + angular.toJson($scope.selected.building));											
											$scope.elfin.SOURCE = $scope.selected.building.ID_G + "/" + $scope.selected.building.CLASSE + "/" + $scope.selected.building.Id;
											$scope.elfin.IDENTIFIANT.OBJECTIF = $scope.selected.building.Id;
										} else {
											$log.debug("building has been reset... ");											
											$scope.elfin.SOURCE = "";
											$scope.elfin.IDENTIFIANT.OBJECTIF = "";
										}
									} else {
										$log.debug("building : " + angular.toJson($scope.selected.building) + "WAITING for initialisation...");
									}
								}, true);								
								
								
								$scope.$watch('selected.owner', function(newOwner, oldOwner) { 
									if ($scope.selected.initialised === true ) {
										if ($scope.selected.owner) {
											$log.debug("owner : " + angular.toJson($scope.selected.owner));											
											var owner = {
											      "Id" : $scope.selected.owner.Id,
											      "ID_G" : $scope.selected.owner.ID_G,
											      "NOM" : "",
											      "GROUPE" : $scope.selected.owner.GROUPE,
											      "VALUE" : ""
											};
											$scope.elfin.PARTENAIRE.PROPRIETAIRE = owner;
											// Updating $scope.selected.owner model from hbChooseOne controller is not 
											// visible to the view model thus requires manual update.
											// This is necessary when the validity state has been set to invalid using 
											// typeahead manual typing, then solving selection through hbChooseOne selection.
											// The latter selection will not be noticed by the view model and thus not reset
											// the field validity state correctly.
											$scope.elfinForm.fournisseur.$setValidity('editable', true)
										} else {
											$log.debug("owner has been reset... ");											
											var owner = {
												      "Id" : "",
												      "ID_G" : "",
												      "NOM" : "",
												      "GROUPE" : "",
												      "VALUE" : ""
												};
											$scope.elfin.PARTENAIRE.PROPRIETAIRE = owner;											
										}
									} else {
										$log.debug("owner : " + angular.toJson($scope.selected.owner) + "WAIING for initialisation...");
									}
								}, true);
								
								$scope.cfcCodes = [
								                   {"name" : "001", "value" : "001 - lalalère"},
								                   {"name" : "002", "value" : "002 - lalalère"},								                   
								                   {"name" : "003", "value" : "003 - lalalère"}
								                   ];
							
								// Benefit from server side cache...
								var xpathForImmeubles = "//ELFIN[@CLASSE='IMMEUBLE']";
								// Asychronous buildings preloading
								hbQueryService.getImmeubles(xpathForImmeubles)
									.then(
											function(immeubles) {
												for (var i = 0; i < immeubles.length; i++) {
													var currImmeuble = immeubles[i];
													currImmeuble.IDENTIFIANT.MERGED_PROPS = currImmeuble.IDENTIFIANT.OBJECTIF + "-" + currImmeuble.IDENTIFIANT.ALIAS
												}
												$scope.immeubles = immeubles;
												$log.debug(">>> IMMEUBLES: " + immeubles.length);
											},
											function(response) {
												var message = "Le chargement de la liste IMMEUBLE a échoué (statut de retour: "
														+ response.status
														+ ")";
												hbAlertMessages.addAlert("danger", message);
											}
										);
						    	
					            /**
					             * Perform operations once we are guaranteed to have access to $scope.elfin instance.
					             */
						    	$scope.$watch('elfin.Id', function() { 

						    		if ($scope.elfin!==null) {

						    			$scope.selected.owner = {
											      "Id" : $scope.elfin.PARTENAIRE.PROPRIETAIRE.Id,
											      "ID_G" : $scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G,
											      "NOM" : $scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM,
											      "GROUPE" : $scope.elfin.PARTENAIRE.PROPRIETAIRE.GROUPE,
											      "VALUE" : $scope.elfin.PARTENAIRE.PROPRIETAIRE.VALUE
											    };
						    			
						    			$scope.selected.initialised = true;
						    			
										// Update elfin properties from catalogue while in create mode
										if ($attrs.hbMode === "create") {
											
											if ($scope.elfin) {

												var currentDate = new Date();
												$scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(currentDate);

												// Get user abbreviation from userDetails service
												$scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation();												
												
												// SAI nb.
												$scope.elfin.IDENTIFIANT.OBJECTIF = "";

												// CFC code
												$scope.elfin.GROUPE = "";
												
												// Default value from catalogue contains repartition list: Reset it.
												$scope.elfin.IDENTIFIANT.VALEUR = "";

												// Reserved for future semantic identifier nb. 
												$scope.elfin.IDENTIFIANT.NOM = "";
												
												// Reset entreprise service provider 
												$scope.elfin.PARTENAIRE.FOURNISSEUR.Id="";
												$scope.elfin.PARTENAIRE.FOURNISSEUR.ID_G="";
												$scope.elfin.PARTENAIRE.FOURNISSEUR.NOM=""; 
												$scope.elfin.PARTENAIRE.FOURNISSEUR.GROUPE="";
															
												// Reset building owner 
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.Id="";
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.ID_G="";
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.NOM=""; 
												$scope.elfin.PARTENAIRE.PROPRIETAIRE.GROUPE="";
												
												$scope.elfin.DIVERS.REMARQUE = "";
												
											} else {
												$log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
											}
										}
									}
						    	}, true);								

//								var focusOnField = function() {
//									$('#objectifSearchHelper').focus();
//								};

								$scope.immeubleChooseOneColumnsDefinition = [
										{
											field : "PARTENAIRE.PROPRIETAIRE.VALUE",
											displayName : "Propriétaire"
										},
										{
											field : "IDENTIFIANT.OBJECTIF",
											displayName : "Numéro de gérance"
										},
										{
											field : "CARACTERISTIQUE.CARSET.CAR[0].VALEUR",
											displayName : "Lieu-dit"
										} ];
								$scope.immeubleChooseOneTemplate = '/assets/views/chooseOneImmeuble.html';

								// TODO: FocusTimeout issue. Find a better
								// solution ?
//								$timeout(focusOnField, 500, true);


								// Load ACTEUR `Entreprise` list
								$scope.entrepriseActors = null;
								var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
								hbQueryService.getActors(xpathForEntreprises).then(
									function(entrepriseActors) {
										$scope.entrepriseActors = entrepriseActors;
									},
									function(response) {
										var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "
												+ response.status
												+ ")";
										hbAlertMessages.addAlert(
												"danger", message);
									});

								
					            // Parameters to hbChooseOne service function for ACTOR selection
					            $scope.actorChooseOneColumnsDefinition = [
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];
					            
					            $scope.collaboratorActorChooseOneColumnsDefinition = [
					                                                        { field:"IDENTIFIANT.NOM", displayName: "Nom"},
																			{ field:"IDENTIFIANT.ALIAS", displayName: "Prénom"},
						                        		   		            { field:"GROUPE", displayName: "Groupe"}
						                        		   	 		   		];					            
					            
					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor2.html';									

					            
								// Allow direct call to new TRANSACTION creation without going through menus items.
								$scope.createNewCommande = function () {
		    	                   	var redirUrl = '/elfin/create/COMMANDE';
		    	                   	$location.path( redirUrl );						        	
						        };					            
					            
		
					            
							} ]);

})();
