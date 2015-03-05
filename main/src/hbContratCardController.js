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
						    				updatePrestationIIOptions($scope.prestationsOptionsData, $scope.elfin.CARACTERISTIQUE.CAR1.UNITE);
							    		}
							    		
						    		};
						    		
						    	}, true);								
								
						    	// Manage defaults from catalog
						    	GeoxmlService.getNewElfin("CONTRAT").get()
					            .then(function(contrat) {
					            		// Get groupeChoices from catalogue default
					            	    $scope.groupeChoices = hbUtil.buildArrayFromCatalogueDefault(contrat.GROUPE);
					            	    
					            	    // Prestation I choices are defined in an ELFIN of CLASSE='LISTE' together with Prestation II dependent choices.
					            	    //$scope.prestation_IChoices = hbUtil.buildArrayFromCatalogueDefault(contrat.CARACTERISTIQUE.CAR1.UNITE);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE CONTRAT n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});								
								
								
						    	// ==== Manage ELFIN @CLASSE='LISTE' for dependent prestation types I and II ==========
						    	
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
						    	 * Updates prestations II options list given `prestationI` value
						    	 */
						    	var updatePrestationIIOptions = function(prestationsOptionsData, prestationI) {

						    		if (prestationsOptionsData && prestationI && prestationI.trim().length > 0) {

						    			for (var i = 0; i < prestationsOptionsData.options.length; i++) {
							    			var option = prestationsOptionsData.options[i];
							    			if (option.value === prestationI) {
							    				// Update options by reference
							    				if (option.options) {
								    				$scope.prestation_IIChoices = buildLevel(option.options);
							    				} else {
							    					$log.warn(">>>> No options found for option.value = " + option.value);
							    				}
							    				break;
							    			}
							    		}						    			
						    		}

						    	};
						    							    	

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
						    	 * getLevelOptions returns the expected prestationsOptionsData data structure 
						    	 * enclosed within an array to keep the return type consistent.
						    	 * Note that in the current usage you need to get the single first array element
						    	 * such as: 
						    	 *  // Given elfin build data object
                                 *  $scope.prestationsOptionsData = getLevelOptions(elfin, undefined, 0)[0];
						    	 * 
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
						    				// Unsupported state
						    			}
						    		}
						    		return levelOptions;
						    	};
						    	
						    	
						    	/**
						    	 * Get the ELFIN LISTE containing the prestation I, II types and initialise the lists.
						    	 * ELFIN Id="G20090113093730441" ID_G="G20060705000012345" CLASSE="LISTE" GROUPE="Prestation type" TYPE="DOCUMENT" NATURE="Management"
						    	 */

						    	var PRESTATION_TYPE_LIST_ID_G = "G20060705000012345";
						    	var PRESTATION_TYPE_LIST_Id = "G20090113093730441";
						    	
						    	GeoxmlService.getElfin(PRESTATION_TYPE_LIST_ID_G, PRESTATION_TYPE_LIST_Id).get().then(function(elfin) {

						    		// Update sorted CARACTERISTIQUE.FRACTION.L by reference.
						    		for (var i = 0 ; i < elfin.CARACTERISTIQUE.FRACTION.L.length ;i++) {
						    			var L = elfin.CARACTERISTIQUE.FRACTION.L[i];
						    			//$log.debug("unsorted C = " + angular.toJson(L));
						    			var sortedC = _.sortBy(L.C, 'POS');
						    			L.C = sortedC;
						    			//$log.debug("sorted C   = " + angular.toJson(L));
						    		}

						    		// Given elfin build data object
						    		$scope.prestationsOptionsData = getLevelOptions(elfin, undefined, 0)[0];

						    		// Initialise prestation I options list.
					    			$scope.prestation_IChoices = buildLevel($scope.prestationsOptionsData.options);
							    	
					    			// Update prestation II options list given prestation I value, if available (elfin loaded).
							    	if ($scope.elfin) {
							    		updatePrestationIIOptions($scope.prestationsOptionsData, $scope.elfin.CARACTERISTIQUE.CAR1.UNITE);
							    	}
						    		
					            }, function() {
					            	var message = "Le chargement de la LISTE des types de prestations (I,II) a échoué. Un ajustement des configurations peut être nécessaire. Veuillez contacter votre administrateur système. (statut de retour: "+ response.status+ ")";
						            hbAlertMessages.addAlert("warning",message);
					            });						    	
						    	
						    	/**
						    	 * prestationsOptionsData expected data structure is as follow 
						    	 */
						    	/*
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
						    	 */

						    	
						    	/**
						    	 * Listen to prestation I value change.
						    	 */
						    	$scope.$watch('elfin.CARACTERISTIQUE.CAR1.UNITE', function(newPrestationsI, oldPrestationsI) { 
						    		
						    		if (newPrestationsI && $scope.prestationsOptionsData) {
						    			// Update dependent prestation II list of options
						    			updatePrestationIIOptions($scope.prestationsOptionsData, newPrestationsI);
						    			// Reset dependant prestation II field value which lost its meaning in the new prestation I context.
						    			$scope.elfin.CARACTERISTIQUE.CAR1.VALEUR = '';							    		
						    		}
						    	}, true);						    	
						    	// ==== Manage ELFIN @CLASSE='LISTE' for dependent prestation types I and II - End ====


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
