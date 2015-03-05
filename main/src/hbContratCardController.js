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
							    		} else {
						    				updatePrestationIIOptions($scope.prestationsOptionsData, $scope.elfin.CARACTERISTIQUE.CAR1.UNITE, $scope.prestation_IIChoicesNew);
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
						    	
						    	/**
						    	 * Updates prestations II options list by reference.
						    	 */
						    	var updatePrestationIIOptions = function(prestationsOptionsData, prestationI, prestationsIIOptions) {
						    		$log.debug(">>>> updatePrestationIIOptions START : prestationI = " + prestationI);
						    		if (prestationsOptionsData && prestationI && prestationI.trim().length > 0) {

						    			for (var i = 0; i < prestationsOptionsData.options.length; i++) {
							    			var option = prestationsOptionsData.options[i];
							    			if (option.value === prestationI) {
							    				// Update options by reference
							    				if (option.options) {
							    					$log.debug(">>>> Options found for option.value = " + option.value);
								    				//prestationsIIOptions = buildLevel(option.options);
								    				$scope.prestation_IIChoicesNew = buildLevel(option.options);
							    				} else {
							    					$log.debug(">>>> No options found for option.value = " + option.value);
							    				}

							    				break;
							    			} else {
							    				$log.debug(">>>>>> option.value = "+option.value+" !== prestationI = " + prestationI);
							    			}
							    		}						    			
						    		}
						    		$log.debug(">>>> updatePrestationIIOptions DONE  : prestationI = " + prestationI + ", prestationsIIOptions = " + angular.toJson(prestationsIIOptions));
						    	};
						    							    	
						    	
						    	
						    	/**
						    	 * Build dependent options lists from the following LISTE definition: 
						    	 */
						    	// ELFIN Id="G20090113093730441" ID_G="G20060705000012345" CLASSE="LISTE" GROUPE="Prestation type" TYPE="DOCUMENT" NATURE="Management"
						    	
						    	var PRESTATION_TYPE_LIST_ID_G = "G20060705000012345";
						    	var PRESTATION_TYPE_LIST_Id = "G20090113093730441";

						    	
						    	// Collect `level` elements matching previous level `key` in elfin of CLASSE LISTE
						    	var collectLevelMatchingKey = function(elfin, key, level) {

						    		// Collect level 0 keys
						    		if (level === 0) {
							    		var optionsDataLevel0Keys = _.map(elfin.CARACTERISTIQUE.FRACTION.L, function(L, i, FRACTION) { return L.C[0].VALUE.trim();} );
							    		// Remove empty elements and duplicate elements
							    		optionsDataLevel0Keys =  _.uniq(_.filter(optionsDataLevel0Keys, function(element){ return element !== ""; }));
							    		//$log.debug("optionsDataLevel0Keys = " + angular.toJson(optionsDataLevel0Keys));
						    			return optionsDataLevel0Keys;
						    		} else if (level > 0) {
							    		var matchingL = _.filter(elfin.CARACTERISTIQUE.FRACTION.L, function(L) { return (L.C[level-1] && L.C[level-1].VALUE.trim() === key);} );
							    		//matchingL.sort();
							    		var matchingKeys = _.map(matchingL, function(L, i, FRACTION) { return L.C[level].VALUE.trim();} );
							    		matchingKeys.sort();
							    		return _.uniq(matchingKeys, true);						    			
						    		} else {
						    			// Unsupported state
						    			return undefined;
						    		}
						    	};						    	
						    	
						    	/**
						    	 * For `level` === 0 `key` parameter value is not taken into account
						    	 */
						    	var getLevelOptions = function(elfin, key, level) {
						    		var levelOptions = [];
						    		var levelMatchingKeys = collectLevelMatchingKey(elfin,key,level);
						    		for (var i = 0; i < levelMatchingKeys.length ; i++) {
						    			var currentKey = levelMatchingKeys[i];						    
						    			if (level === 0) {
						    				levelOptions.push( 
							    				{
									    			name : currentKey,
									    			value : currentKey,
									    			options : getLevelOptions(elfin, currentKey, level+1)
							    				}
						    				);
						    			} else if (level === 1) {
						    				levelOptions.push( 
							    				{
									    			name : currentKey,
									    			value : currentKey,
									    			options : getLevelOptions(elfin, currentKey, level+1)
							    				}
							    			);						    				
						    			} else if (level === 2) {
						    				levelOptions.push( 
							    				{
									    			name : currentKey,
									    			value : currentKey
							    				}
							    			);							    				
						    			} else {
						    				// Unsupported situation
						    			}
						    		}
						    		return levelOptions;
						    	};
						    	
						    	
						    	GeoxmlService.getElfin(PRESTATION_TYPE_LIST_ID_G, PRESTATION_TYPE_LIST_Id).get().then(function(elfin) {
						    		// Given elfin build data object
						    		$log.debug("LISTE Prestation type = \n" + angular.toJson(elfin) );
						    		// TODO: create build function in hbUtil
						    		// $scope.prestationsOptionsData =
						    		
						    		// Update sorted CARACTERISTIQUE.FRACTION.L by reference.
						    		for (var i = 0 ; i < elfin.CARACTERISTIQUE.FRACTION.L.length ;i++) {
						    			var L = elfin.CARACTERISTIQUE.FRACTION.L[i];
						    			//$log.debug("unsorted C = " + angular.toJson(L));
						    			var sortedC = _.sortBy(L.C, 'POS');
						    			L.C = sortedC;
						    			//$log.debug("sorted C   = " + angular.toJson(L));
						    		}

						    		$scope.prestationsOptionsData = getLevelOptions(elfin, undefined, 0)[0];

						    		$log.debug("$scope.prestationsOptionsData.options = " + angular.toJson($scope.prestationsOptionsData.options));						    		
						    		
					    			$scope.prestation_IChoicesNew = buildLevel($scope.prestationsOptionsData.options);
							    	
							    	if ($scope.elfin) {
							    		updatePrestationIIOptions($scope.prestationsOptionsData, $scope.elfin.CARACTERISTIQUE.CAR1.UNITE, $scope.prestation_IIChoicesNew);
							    	}
							    	
							    	$log.debug("prestation_IChoicesNew = " + angular.toJson($scope.prestation_IChoicesNew));						    		
						    		
					            }, function() {
					            	// TODO: log exception, feedback to end-user?
					            });						    	
						    	
						    	
//						    	$scope.prestationsOptionsData = {
//						    			name : "Prestation",
//						    			value : "Prestation",
//						    			options : [
//						    			                  { name : "Toiture" ,
//						    			                	value : "Toiture" ,
//						    			                	options : [
//										    			                  { name : "Couverture" , value : "Couverture" },
//										    			                  { name : "Etanchéité" , value : "Etanchéité" },
//										    			                  { name : "Ferblanterie" , value : "Ferblanterie" }
//						    			                	]  
//						    			                  },
//						    			                  { name : "Sanitaire" ,
//						    			                	value : "Sanitaire" ,
//						    			                	options : [
//						    			                	             { name : "Pompe de relevage" , value : "Pompe de relevage" },
//						    			                	             { name : "Boiler/Production" , value : "Boiler/Production" },
//						    			                	             { name : "Traitement d'eau" , value : "Traitement d'eau" },
//						    			                	             { name : "Séparateur de graisse/hydrocarbure" , value : "Séparateur de graisse/hydrocarbure" }
//						    			                	]
//							    			              }						    			                  
//						    			]
//						    	};
						    	
						    	
						    	$scope.testI = '';
						    	$scope.testII = '';
						    	
						    	
						    	$scope.$watch('elfin.CARACTERISTIQUE.CAR1.UNITE', function(newPrestationsI, oldPrestationsI) { 
//						    		$log.debug(">>>> watched CAR1.UNITE: oldPrestationsI = "+oldPrestationsI + " => newPrestationsI = " + newPrestationsI);
						    		
						    		if (newPrestationsI && $scope.prestationsOptionsData) {
						    			// Update dependent prestation II list of options
						    			updatePrestationIIOptions($scope.prestationsOptionsData, newPrestationsI, $scope.prestation_IIChoicesNew);

						    			// Reset dependant prestation II field value which lost its meaning in the new prestation I context.
						    			$scope.elfin.CARACTERISTIQUE.CAR1.VALEUR = '';							    		
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
