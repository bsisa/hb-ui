(function() {

	
	/**
	 * HbChooseActorController definition.
	 * 
	 * To achieve correct behaviour for this controller is non trivial  
	 * due to inherent asynchronous nature of data loading.
	 * It must be correctly identified whether the $scope.actorModel is:
	 * empty, non-empty or not yet initialised.
	 * 
	 * If initialised and empty then we set it to a default value otherwise its
	 * value must be preserved and selection state: $scope.selected.{actor, actorDisplay}
	 * be updated accordingly.
	 * 
	 * As long as the model initialisation has not completed no update should 
	 * be performed to selection state: $scope.selected.{actor, actorDisplay}
	 * 
	 * The value of $scope.actorModel is considered not initialised if equal
	 * to undefined.
	 * If equal to null, empty string '' or string 'null' it is considered empty
	 * Any other value is considered non-empty.
	 * 
	 */
	angular.module('hb5').controller(
			'HbChooseActorController',
			[ 		'$attrs',
					'$scope',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'$timeout',
					'hbAlertMessages',
					'hbUtil',
					'GeoxmlService',
					'hbQueryService',
					function($attrs, $scope, $modal, $routeParams,
							$location, $log, $timeout, hbAlertMessages, hbUtil, GeoxmlService, hbQueryService) {

						$log.debug("    >>>> Using HbChooseActorController");
						
						// ========================================================================
						// NEW IMPLEMENTATION START
						// ========================================================================
						
						$scope.modelInitialised = false;
						
						/**
						 *  Wait for the actor to have a chance to load before displaying validation error.
						 */
						$scope.validateActor = false;
						
						/**
						 * Actor linked to the current directive.
						 */
						$scope.selected = { "actor" : null , "actorDisplay" : null };						
						
						/**
						 * Enables actor validation with a delay.
						 */
						$scope.enableValidateActor = function() {
							$timeout(function(){
								$scope.validateActor = true;
							}, 2000, true);
						};						
						
						/**
						 * Load ELFIN given its collectionId (ELFIN.ID_G) and elfinId (ELFIN.Id)
						 */
				        $scope.getElfinActor = function (collectionId, elfinId) {
				        	
					        GeoxmlService.getElfin(collectionId, elfinId).get()
					        .then(function(actorElfin) {
					        	// Force CAR array sorting by POS attribute
					        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
					        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
					        	//       Need review of other similar operations
					        	if ( actorElfin['CARACTERISTIQUE'] != null && actorElfin['CARACTERISTIQUE']['CARSET'] != null && actorElfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
					        		hbUtil.reorderArrayByPOS(actorElfin['CARACTERISTIQUE']['CARSET']['CAR']);
					        	}
					        	selectedActorUpdate(actorElfin);
					        	actorModelsUpdate(actorElfin);

					        	$scope.enableValidateActor();
					        }, function(response) {
					        	var message = "Aucun object ACTEUR disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
					        	$log.warn("HbChooseActorController - statut de retour: " + response.status + ". Message utilisateur: " + message);
					            hbAlertMessages.addAlert("danger",message);
					            $scope.enableValidateActor();
					        });
			        		
			        	};							


			        	/**
			        	 * actorModel references an ELFIN property with Id, ID_G, GROUPE and NOM properties.
			        	 * This listener is used only for actor initialisation 
			        	 */
			        	var actorModelWatchDeregistration = $scope.$watch('actorModel.Id', function(newId, oldId) {
			        		
			        		var oldIdValue = (oldId === null) ? 'null' : (oldId === undefined) ? 'undefined' : (oldId.trim() === '' ? 'empty string' : oldId);
			        		var newIdValue = (newId === null) ? 'null' : (newId === undefined) ? 'undefined' : (newId.trim() === '' ? 'empty string' : newId);
			            	
			        		$log.debug(">>>>>>>>>>>> HbChooseActorController - 'actorModel.Id' LISTENER: oldId = " + oldIdValue + " => newId = " + newIdValue);
			        		if (newId !== undefined) {
			        			if (newId === null || newId.trim() === '' || newId.trim() === 'null') {
				        			$log.debug(">>>>>>>>>>>> HbChooseActorController - 'actorModel.Id' LISTENER: EMPTY model");
				            		// Force validation in create mode as well
				            		$scope.enableValidateActor();			        			
				        		} else {
				        			$log.debug(">>>>>>>>>>>> HbChooseActorController - 'actorModel.Id' LISTENER: DATA for model: newId = " + newId);
				        			// Make sure an actor reference is defined before trying to load actor elfin
				        			$scope.getElfinActor($scope.actorModel.ID_G, $scope.actorModel.Id);

				        			// Special case when for instance expected actor 'role' does not exist in the system.
					            	if (!$scope.actorModel == undefined && $scope.actorModel == null) {
					            		var roleStr = $scope.actorRole ? $scope.actorRole : "";
					            		var message = "La sauvegarde du champs lié à la donnée d'acteur " + roleStr + " n'est pas possible. Veuillez notifier votre administrateur de base de données.";
					            		hbAlertMessages.addAlert("danger",message);
					            		$log.error(">>>>>>>>>>>> HbChooseActorController - 'actorModel.Id' LISTENER: - MISSING MANDATORY actorModel OBJECT found !");
					            	}				        			

				        			// Remove listener now that we tried loading the actor elfin object.
				        			actorModelWatchDeregistration();
				        		}			        			
			        		} else {
			        			$log.debug(">>>>>>>>>>>> HbChooseActorController - 'actorModel.Id' LISTENER: UNDEFINED model");
			            		// Keep on listening as long as newId is undefined
			            		$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('actorModel.Id') => Keep on listening as long as newId is undefined");
			            	}
			            });			        	
			        	
			        	// =================================================================
			        	// XPath restriction definition for actors selection list query
			        	// =================================================================
						var xpathForActor = null;
						// Restrict to provided hb-choose-actor-role 
						if ($scope.actorRole) {
							if (_.contains($scope.actorRole, ",")) {
								var rolesArray = $scope.actorRole.split(",");
								// Example: ELFIN[@CLASSE='ACTEUR' and (IDENTIFIANT/QUALITE='Responsable chauffage' or IDENTIFIANT/QUALITE='Concierge')]
								xpathForActor = "//ELFIN[@CLASSE='ACTEUR' and ("; 
								for (var i = 0; i < rolesArray.length; i++) {
									xpathForActor += "IDENTIFIANT/QUALITE='"+rolesArray[i].trim()+"'";
									xpathForActor += (i===(rolesArray.length-1)) ? ")]" : " or ";
								}
							} else {
								xpathForActor = "//ELFIN[@CLASSE='ACTEUR' and IDENTIFIANT/QUALITE='"+$scope.actorRole+"']";
							}
						} else { // Select all actors 
							xpathForActor = "//ELFIN[@CLASSE='ACTEUR']";
						}
						
			            // Asychronous actors preloading
			            hbQueryService.getActors(xpathForActor)		
						.then(function(actors) {
								$scope.actors = actors;
								// TODO: Manage default only if actorModel initialisation did not lead to actorModel data
								if ($scope.defaultByName && $scope.modelInitialised && $scope.actorModel != undefined 
										&& $scope.actorModel != null && $scope.actorModel.Id.trim().length > 0) {
									setDefaultActorByName();
								}
								//$log.debug("    >>>> HbChooseActorController: " + $scope.actors.length + " actors loaded.");
							},
							function(response) {
								var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});								
						
						
						/**
				         * Modal panel to update an elfin reference with the selection from a list of actors.
				         */
				        $scope.hbChooseActor = function () {
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/hbChooseActorModalDialog.html',
				                scope: $scope,
				                controller: 'HbChooseActorModalController',
				                resolve: {
				                	elfins: function () {
				                    	return $scope.actors;
				                    },
				                    columnsDefinition: function() {
				                    	return [ { field:"IDENTIFIANT.NOM", displayName: "Nom"},{ field:"IDENTIFIANT.ALIAS", displayName: "Prénom"},{ field:"GROUPE", displayName: "Abréviation"} ];
				                    },
				                    role: function () {
				                    	return $scope.actorRole;
				                    }
				                },                
				                backdrop: 'static'
				            });
				
				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {
				            	if (selectedElfins && selectedElfins.length > 0) {
						        	/**
						        	 * actor model type relates to geoXml.xsd definition.
						        	 * Currently actors references are stored in dedicated 
						        	 * PARTENAIRE elements all of them of 'PERSONNEType' 
						        	 * as well as in line element ('L') of generic FRACTION
						        	 * of 'MATRICEType' element.
						        	 * For use with line element ('L') of generic FRACTION
						        	 * of 'MATRICEType' element use hb-actor-line-converter 
						        	 * directive.
						        	 */
				            		var selectedElfin = selectedElfins[0];
				            		selectedActorUpdate(selectedElfin);
					        		actorModelsUpdate(selectedElfin);

					            	// Notify user current data need saving.
					            	$scope.elfinForm.$setDirty();			
					            	
				            	} else {
				            		$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                $log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };
				        
				        
				        /**
				         * Update bound actorModel, actorElfinModel provided elfinActor
				         */
				        var actorModelsUpdate = function(elfinActor) {
			            	// Update the new ACTOR ids
			            	$scope.actorModel.ID_G = elfinActor.ID_G;
			            	$scope.actorModel.Id = elfinActor.Id;
			            	// According to the GeoXML Schema GROUP and NOM are part of USAGER.
			            	$scope.actorModel.GROUPE = elfinActor.GROUPE;
			            	$scope.actorModel.NOM = elfinActor.IDENTIFIANT.NOM;			            		
		            		
			            	// Reset VALUE which should no more be used.
			            	$scope.actorModel.VALUE = "";		
			            	
			            	// Provide access to full ACTOR ELFIN model to provide 
			            	// all properties to external scope for display without 
			            	// requiring extra API call.  
			            	$scope.actorElfinModel = elfinActor;
			            	
			            	// Let the scope know the actor model update has completed
			            	$scope.modelInitialised = true;
				        };				        
				        
				        /**
				         * Update scope selected actor and display string
				         */
				        var selectedActorUpdate = function(selectedActor) {
				        	// Update selected actor instance in scope
				        	$scope.selected.actor = selectedActor;
				        	// Update selected actor display string
				        	$scope.selected.actorDisplay = ( ( $scope.selected.actor.IDENTIFIANT.NOM === "" || _.isNull($scope.selected.actor.IDENTIFIANT.NOM) || _.isUndefined($scope.selected.actor.IDENTIFIANT.NOM)) ? ("") : ($scope.selected.actor.IDENTIFIANT.NOM + " - ") ) + $scope.selected.actor.GROUPE;
				        };
				        
				        /**
				         * Procedure to set default actor by name
				         */
				        var setDefaultActorByName = function() {
							var defaultActorIsSet = false;
							for (var i=0; actors.length; i++) {
								var actor = actors[i];
								if (actor.IDENTIFIANT.NOM == $scope.defaultByName) {
									//$scope.selected.actor = actor;
									selectedActorUpdate(actor);
									actorModelsUpdate(actor);
					        		//defaultModelUpdate();			
					        		//defaultModelDisplayUpdate();
									defaultActorIsSet = true;
									break;
								}
							}
							if (!defaultActorIsSet) {
								var message = "L'ACTEUR par défaut correspondant au nom: " + $scope.defaultByName + " n'a pas pu être trouvé parmi les " + actors.length + " acteurs disponibles.";
					            hbAlertMessages.addAlert("warning",message);
							}				        	
				        };

					} ]); // End of HbChooseActorController definition
	


	/**
	 * HbChooseActorModalController definition
	 */
	angular
		.module('hb5')
		.controller(
				'HbChooseActorModalController',
				[
						'$scope',
						'$modalInstance',
						'$filter',
						'$log',
						'$timeout',
						'hbUtil',
						'elfins',
						'columnsDefinition',
						'role',
						function($scope, $modalInstance, $filter, $log,
								$timeout, hbUtil, elfins,
								columnsDefinition, role) {
							
							// ============================================================
							// Custom search field used to filter elfins
							// ============================================================    	
							// Default ng-grid showFilter box requires an extra click 
							// to be accessed and is ugly. Let's define our own 
							
							$scope.role = role;
							
							$scope.search = { text: ""};
							
							// TODO: following usage goes through all elfin properties with 
							// search.text which is not very user friendly (matches outside 
							// visual elfin properties.) Use custom filter, see immeubleFilter. 
							$scope.elfins = $filter('filter')(elfins, $scope.search.text , false);
							
							$scope.$watch('search.text', function() { 
								$scope.gridOptions.filterOptions.filterText = $scope.search.text;
								}, true);
							// ============================================================
							
							
							// ============================================================
							// Manage user selection
							// ============================================================
							
							// Contains the result of user selection. 
							// While gridOptions multiSelect attribute equals false 
							// the array will only be zero or one element. 
							$scope.selectedElfins = [];
							
							// Used to display current selection value
							$scope.currentSelection = null;
							
							// Listener maintaining currentSelection value 
							$scope.$watchCollection('selectedElfins', function(newSelectedElfins , oldSelectedElfins) {
								// Reset current selection if no elfin selected
								if (!newSelectedElfins || newSelectedElfins.length === 0) {
									$scope.currentSelection = null;
								} else if (newSelectedElfins && newSelectedElfins.length > 0) {
									// Assign selected elfin
									$scope.currentSelection = $scope.selectedElfins[0];
								}
							}, true);
							
							
							// ============================================================
							// Manage ng-grid row double click event using gridOptions plugin
							// ============================================================
							
							var ngGridDoubleClickPluginInstance = new ngGridDoubleClickPlugin();
							
							var selectionConfirmed = function() {
								$modalInstance.close($scope.selectedElfins);
							};
							
							$scope.doubleClickListener = function(rowItem) {
								selectionConfirmed();
							};
							
							
							// ng-grid options. See ng-grid API Documentation for details.
							$scope.gridOptions = {
							        data: 'elfins',
							        columnDefs: columnsDefinition,
							        multiSelect: false,
							        selectedItems: $scope.selectedElfins,
							        showColumnMenu: false, // Useful for grouping 
							        showFilter: false, // Ugly look, redefine our own search field
							        filterOptions : { filterText: '', useExternalFilter: false },
							        doubleClickFunction: $scope.doubleClickListener,
							        plugins: [ngGridDoubleClickPluginInstance]
							    };    	
							
							
							$scope.ok = function () {
								selectionConfirmed();
							};
							$scope.cancel = function () {
							    $modalInstance.dismiss('cancel');
							};
							
							
							/**
							 * ngGridDoubleClickPlugin definition - see http://angular-ui.github.io/ng-grid/ API documentation
							 * This plugin provides ng-grid with a new doubleClickFunction called when 
							 * a row is double clicked. The first element of of the selectedItems is 
							 * passed as single function parameter.
							 */
							function ngGridDoubleClickPlugin() {
							
								var self = this;
							    self.$scope = null;
							    self.gridRef = null;
							 
							    // Called when ng-grid directive executes.
							    self.init = function(scope, grid, services) {
							        // Keep references of grid scope and grid object received from ng-grid directive
							        self.$scope = scope;
							        self.gridRef = grid;
							        // Trigger grid events assignment.
							        self.assignEvents();
							    };
							    self.assignEvents = function() {
							        // Set double click event handler to the header container.
							        self.gridRef.$viewport.on('dblclick', self.onDoubleClick);
							    };
							    // Double click function
							    self.onDoubleClick = function(event) {
							    	// Configure new function name and signature, here: doubleClickFunction
							        self.gridRef.config.doubleClickFunction(self.$scope.selectedItems[0]);
							    };
							};
							
							
							var focusOnSearchField = function() {
								$('#searchTextInput').focus();	
							};        
							
							// TODO: FocusTimeout issue. Find a better solution ? 
							$timeout(focusOnSearchField, 250, false);

						}]);	// End of HbChooseActorModalController definition
        
})();
