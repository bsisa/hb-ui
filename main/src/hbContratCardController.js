(function() {

	angular
			.module('hb5')
			.controller(
					'HbContratCardController',
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
							function($scope, $attrs, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, hbQueryService) {

								//$log.debug("    >>>> Using HbContratCardController");

								
						    	// Check when elfin instance becomes available 
						    	$scope.$watch('elfin.Id', function() { 
						    		
						    		if ($scope.elfin!=null) {
						    			/**
						    			 * Perform template clean up tasks while in create mode.
						    			 */
							    		if ($attrs.hbMode === "create") {
							    			if ($routeParams.sai) {
							    				$scope.elfin.IDENTIFIANT.OBJECTIF = $routeParams.sai;
							    				// Reset choices list init. values.
							    				$scope.elfin.CARACTERISTIQUE.CAR1.UNITE = '';
							    				$scope.elfin.CARACTERISTIQUE.CAR1.VALEUR = '';
							    			}
							    			$scope.elfin.GROUPE = "";
							    		}
							    		
						    		};
						    		
						    	}, true);								
								
						    	GeoxmlService.getNewElfin("CONTRAT").get()
					            .then(function(contrat) {
					            		// Get groupeChoices from catalogue default
					            	    $scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(contrat.GROUPE);
					            	    $scope.prestation_IChoices = hbUtil.buildArrayFromCatalogueDefault(contrat.CARACTERISTIQUE.CAR1.UNITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE CONTRAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});								
								
								
						    	// ===================== PROOF OF CONCEPT START ======================================						    	
						    	
						    	/**
						    	 * Build dependent options lists from the following LISTE definition: 
						    	 */
						    	// ELFIN Id="G20090113093730441" ID_G="G20060705000012345" CLASSE="LISTE" GROUPE="Prestation type" TYPE="DOCUMENT" NATURE="Management"
						    	
						    	var PRESTATION_TYPE_LIST_ID_G = "G20060705000012345";
						    	var PRESTATION_TYPE_LIST_Id = "G20090113093730441";
						    		
						    	
						    	GeoxmlService.getElfin(PRESTATION_TYPE_LIST_ID_G, PRESTATION_TYPE_LIST_Id).get().then(function(elfin) {
						    		// Given elfin build data object
						    		$log.debug("LISTE Prestation type = \n" + angular.toJson(elfin) );
						    		// TODO: create build function in hbUtil
						    		// $scope.prestationsOptionsData =
						    		
						    		
							    	$scope.prestation_IChoicesNew = buildLevel($scope.prestationsOptionsData.options);
							    	$log.debug("prestation_IChoicesNew = " + angular.toJson($scope.prestation_IChoicesNew));						    		
						    		
					            }, function() {
					            	
					            });						    	
						    	
						    	$scope.prestationsOptionsData = {
						    			name : "Prestation",
						    			value : "Prestation",
						    			options : [
						    			                  { name : "Toiture" ,
						    			                	value : "Toiture" ,
						    			                	options : [
										    			                  { name : "Couverture" , value : "Couverture" },
										    			                  { name : "Etanchéité" , value : "Etanchéité" },
										    			                  { name : "Ferblanterie" , value : "Ferblanterie" }
						    			                	]  
						    			                  },
						    			                  { name : "Sanitaire" ,
						    			                	value : "Sanitaire" ,
						    			                	options : [
						    			                	             { name : "Pompe de relevage" , value : "Pompe de relevage" },
						    			                	             { name : "Boiler/Production" , value : "Boiler/Production" },
						    			                	             { name : "Traitement d'eau" , value : "Traitement d'eau" },
						    			                	             { name : "Séparateur de graisse/hydrocarbure" , value : "Séparateur de graisse/hydrocarbure" }
						    			                	]
							    			              }						    			                  
						    			]
						    	};
						    	
						    	/**
						    	 * Extracts name values from options data structure
						    	 */
						    	var buildLevel = function(options) {
						    		var jsonString = '[';
									for (var i = 0; i < options.length; i++) {
										var option = options[i];
										jsonString += '{"name" : "' + option.name + '", "value":' + '"' + option.value + '"}';  
										if (i < (options.length - 1)) {
											jsonString += ',';
										}
									};
									jsonString += ']';
									return angular.fromJson(jsonString);
						    	};
						    	
						    	$scope.testI = '';
						    	$scope.testII = '';
						    	
						    	
						    	$scope.$watch('elfin.CARACTERISTIQUE.CAR1.UNITE', function(newPrestationsI, oldPrestationsI) { 
						    		$log.debug(">>>> watched CAR1.UNITE: oldPrestationsI = "+oldPrestationsI + " => newPrestationsI = " + newPrestationsI);
						    		
						    		if (newPrestationsI) {
						    		
							    		for (var i = 0; i < $scope.prestationsOptionsData.options.length; i++) {
							    			var option = $scope.prestationsOptionsData.options[i];
							    			if (option.value === newPrestationsI) {
							    				$scope.prestation_IIChoicesNew = buildLevel(option.options);
							    				break;
							    			}
							    		}
							    		// On CAR1.UNITE change select the correct contextual sub-menu (sub options) if possible
							    		// keep it empty otherwise. 
							    		// To deal with: ? earase the dependent value on master one change!?
							    		// Does any inconsistency exist in production data?
							    		$log.debug("prestation_IIChoicesNew = " + angular.toJson($scope.prestation_IIChoicesNew));							    		
						    		}
						    	}, true);						    	
						    	
						    	// ===================== PROOF OF CONCEPT END ==========================================
						    	
								var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
								$scope.entrepriseActors = null;
								hbQueryService.getActors(xpathForEntreprises)
										.then(
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
					            $scope.actorChooseOneTemplate = '/assets/views/chooseOneActor.html';								

							} ]);

})();
