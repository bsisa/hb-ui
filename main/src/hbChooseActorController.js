(function() {

	
	/**
	 * HbChooseActorController definition
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
					function($attrs, $scope, $modal, $routeParams,
							$location, $log, $timeout, hbAlertMessages, hbUtil, GeoxmlService) {

						$log.debug("    >>>> Using HbChooseActorController");
						
						// ========================================================================
						// NEW IMPLEMENTATION START
						// ========================================================================
						
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
					        	$log.debug(">>>>>>>>>>>> HbChooseActorController actorElfin.Id = " + actorElfin.Id);
					        	$scope.selected.actor = actorElfin;
					        	$scope.selected.actorDisplay = $scope.selected.actor.IDENTIFIANT.NOM + " - " + $scope.selected.actor.GROUPE;					        	
					        	
					        	$scope.enableValidateActor();
					        	}, function(response) {
					        	var message = "Aucun object ACTEUR disponible pour la collection: " + collectionId + " et l'identifiant: " + elfinId + ".";
					        	$log.warn("HbChooseActorController - statut de retour: " + response.status + ". Message utilisateur: " + message);
					            hbAlertMessages.addAlert("danger",message);
					            $scope.enableValidateActor();
					        });
			        		
			        	};							
						

//			        	$scope.$watch('elfin.Id', function() { 					    		
//			        		// Only load actor if elfin is available with actor reference defined.
//			        		if ($scope.elfin != null
//								&& $scope.actorModel.ID_G != null
//								&& $scope.actorModel.ID_G != ''
//								&& $scope.actorModel.Id != null
//								&& $scope.actorModel.Id != '') {
//				    			$scope.getElfinActor($scope.actorModel.ID_G, $scope.actorModel.Id);
//				    		}
//			        	});
			            	

			        	/**
			        	 * actorModel references an ELFIN property with Id, ID_G, GROUPE and NOM properties.
			        	 * This listener is used only for actor initialisation 
			        	 */
			        	var actorModelWatchDeregistration = $scope.$watch('actorModel.Id', function(newId, oldId) {			        		
			            	$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('actorModel.Id') = " + oldId + " => " + newId);

			            	// Only initialise if no selected actor object exist 
			            	if ( $scope.selected.actor == null ) {
			            		$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('actorModel.Id') => $scope.selected.actor == null - OK");
				            	// Make sure an actor reference exists before trying to load actor elfin
				            	if ( newId && newId != null && newId.trim() != '') {
				            		$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('actorModel.Id') => getElfinActor for " + newId);
					            	$scope.getElfinActor($scope.actorModel.ID_G, $scope.actorModel.Id);
					            	// Notify the user the data need saving.
					            	//$scope.elfinForm.$setDirty();
					            	// TODO: this is not OK for hbMode='create' !!!
					            	$log.debug(">>>>>>>>>>>> HbChooseActorController DEREGISTRATION OF $scope.$watch('actorModel.Id') ");
				            		// Remove listener now that we tried loading the actor elfin object.
					            	actorModelWatchDeregistration();		            	
				            	}
			            	} else {
			            		$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('actorModel.Id') => $scope.selected.actor NOT NULL !!! ");
			            		$log.debug(">>>>>>>>>>>> HbChooseActorController DEREGISTRATION OF $scope.$watch('actorModel.Id') ");
			            		// Remove listener if selected actor already exists 
			            		actorModelWatchDeregistration();
			            	}


			            });			        	
			        	
//			            /**
//			             * Update current actor object upon actor.Id change link to ACTOR upon new ACTOR selection
//			             */
//			            $scope.$watch('selected.actor.Id', function(newId, oldId) {
//			            	
//			            	$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('selected.actor.Id') = " + oldId + " => " + newId);
//			            	
//			            	if ( newId && $scope.actorModel && ($scope.actorModel.Id != $scope.selected.actor.Id) ) {
//
//			            		$log.debug(">>>>>>>>>>>> HbChooseActorController $scope.$watch('selected.actor.Id') => UPDATING actorModel... ");
//			            		
//					        	$scope.selected.actorDisplay = $scope.selected.actor.IDENTIFIANT.NOM + " - " + $scope.selected.actor.GROUPE;
//			            		
//				            	// Update the new ACTOR ids
//				            	$scope.actorModel.ID_G = $scope.selected.actor.ID_G;
//				            	$scope.actorModel.Id = $scope.selected.actor.Id;
//				            	// According to the GeoXML Schema GROUP and NOM are part of USAGER.
//				            	$scope.actorModel.GROUPE = $scope.selected.actor.GROUPE;
//				            	$scope.actorModel.NOM = $scope.selected.actor.IDENTIFIANT.NOM;			            		
//			            		
//				            	// Reset VALUE which should no more be used.
//				            	$scope.actorModel.VALUE = "";				            	
//				            	
//				            	// Notify the user the data need saving.
//				            	//$scope.elfinForm.$setDirty();			            		
//			            	}
//
//			            });			        	
			        	
						// ========================================================================
						// NEW IMPLEMENTATION END
						// ========================================================================
						
						$scope.defaultActor = null;
						
						var xpathForActor = null;
						// Restrict to provided hb-choose-actor-role 
						//if ($attrs.hbChooseActorRole) {
						if ($scope.actorRole) {
							//xpathForActor = "//ELFIN[@CLASSE='ACTEUR' and IDENTIFIANT/QUALITE='"+$attrs.hbChooseActorRole+"']";
							xpathForActor = "//ELFIN[@CLASSE='ACTEUR' and IDENTIFIANT/QUALITE='"+$scope.actorRole+"']";
						} else { // Select all actors 
							xpathForActor = "//ELFIN[@CLASSE='ACTEUR']";
						}
						
						//if ($attrs.hbChooseActorDefaultByName) {
//						if ($scope.defaultByName) {
//							//var name = $attrs.hbChooseActorDefaultByName.trim();
//							var name = $scope.defaultByName.trim();
//							if (name!=null && name.length > 0) {
//								$scope.defaultByName = name;
//								$log.debug(">>>> SET default by name to " + $scope.defaultByName);
//							}
//						}
						
			            // TODO: actorsCollectionId must come from server configuration resource.
			            $log.debug("TODO: HbChooseActorController: actorsCollectionId must come from server configuration resource.");
			            var actorsCollectionId = 'G20060401225530100';			        	

			            // Asychronous actors preloading
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForActor})
						.then(function(actors) {
								$log.debug("    >>>> HbChooseActorController: loading actors ...");
								$scope.actors = actors;
								if ($scope.defaultByName) {
									for (var i=0; actors.length; i++) {
										var actor = actors[i];
										if (actor.IDENTIFIANT.NOM == $scope.defaultByName) {
											$scope.defaultActor = actor;
											$log.debug(">>>> SET default actor to Id " + $scope.defaultActor.Id);
											break;
										}
									}
								}
								 
								$log.debug("    >>>> HbChooseActorController: " + $scope.actors.length + " actors loaded.");
							},
							function(response) {
								var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});								
						
						
						/**
				         * Modal panel to update an elfin reference with the selection from a list of actors.
				         */
				        //$scope.hbChooseActor = function (selected, selectedPathElement) {
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
				                    	//return $attrs.hbChooseActorRole;
				                    }
				                },                
				                backdrop: 'static'
				            });
				
				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {
				            	if (selectedElfins && selectedElfins.length > 0) {
				            		var selectedElfin = selectedElfins[0];
				            		//selected[selectedPathElement] = selectedElfin;
				            		
				            		$scope.selected.actor = selectedElfin;
				            		
						        	$scope.selected.actorDisplay = $scope.selected.actor.IDENTIFIANT.NOM + " - " + $scope.selected.actor.GROUPE;
				            		
					            	// Update the new ACTOR ids
					            	$scope.actorModel.ID_G = $scope.selected.actor.ID_G;
					            	$scope.actorModel.Id = $scope.selected.actor.Id;
					            	// According to the GeoXML Schema GROUP and NOM are part of USAGER.
					            	$scope.actorModel.GROUPE = $scope.selected.actor.GROUPE;
					            	$scope.actorModel.NOM = $scope.selected.actor.IDENTIFIANT.NOM;			            		
				            		
					            	// Reset VALUE which should no more be used.
					            	$scope.actorModel.VALUE = "";				            		
				            		
					            	// Notify user current data need saving.
					            	$scope.elfinForm.$setDirty();			
					            	
				            	} else {
				            		$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                $log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };
				        
				        
				        // TODO: add check on actorModel availability, ID_G, Id...
				        //$scope.getElfinActor($scope.actorModel.ID_G, $scope.actorModel.Id);				        
				        
				        

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
