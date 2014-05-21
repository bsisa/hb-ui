(function() {

	angular.module('hb5').controller(
			'HbConstatCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						$log.debug("    >>>> Using ConstatCardController");
						
					
						// TODO: get this dynamically from HB5 catalogue
						$scope.statusTypes = {
							Vu : "Vu",
							SUIVRE : "SUIVRE"
						};

			            // Parameter to hbChooseOne service function
						$scope.entrepriseActors = null;
			            // Parameter to hbChooseOne service function
						$scope.collaboratorActors = null;
						

				        //   /api/melfin/G20060401225530100?xpath=//ELFIN[IDENTIFIANT/QUALITE='Entreprise']
			            var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
			            //var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";
			            var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE!='Entreprise']";
			            // TODO: actorsCollectionId must come from server configuration resource.
			            $log.debug("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
			            var actorsCollectionId = 'G20060401225530100';
			            
			            // Asychronous entrepriseActors preloading
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForEntreprises})
						.then(function(entrepriseActors) {
								$scope.entrepriseActors = entrepriseActors;
							},
							function(response) {
								var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});
			            
			            // Asychronous collaboratorActors preloading
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForCollaborator})
						.then(function(collaboratorActors) {
								$scope.collaboratorActors = collaboratorActors;
							},
							function(response) {
								var message = "Le chargement des ACTEURS Collaborateur a échoué (statut de retour: "+ response.status+ ")";
					            hbAlertMessages.addAlert("danger",message);
							});	
			            
			            
			            // Parameter to hbChooseOne service function
			            $scope.actorChooseOneColumnsDefinition = [
			                        		   		            { field:"GROUPE", displayName: "Groupe"}
			                        		   	 		   		];
			            // Parameter to hbChooseOne service function
			            $scope.actorChooseOneTemplate = '/assets/views/chooseActor.html';
			            
						/**
				         * Modal panel to update a target elfin property 
				         * with a source elfin property whose elfin has 
				         * been selected from a list of elfins.
				         */
				        $scope.hbChooseOne = function (targetElfin, targetPath, elfins, sourcePath, columnsDefinition, template) {
				        	
				        	$log.debug(">>>> ON CHOOSE :: targetElfin = : " + targetElfin.Id);
				        	
				            var modalInstance = $modal.open({
				                templateUrl: template,
				                scope: $scope,
				                controller: 'HbChooseOneController',
				                resolve: {
				                	elfins: function () {
				                    	return elfins;
				                    },
				                    columnsDefinition: function() {
				                    	return columnsDefinition;
				                    },
				                    sourcePath: function() {
				                    	return sourcePath;
				                    }
				                },                
				                backdrop: 'static'
				            });

				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {
				            	if (selectedElfins && selectedElfins.length > 0) {
				            		var sourceElfin = selectedElfins[0];
				            		hbUtil.applyPaths(targetElfin, targetPath, sourceElfin, sourcePath);
				            		$scope.elfinForm.$setDirty();
				            	} else {
				            		$log.debug("No selection returned!!!");				            		
				            	}
				            	
				            }, function () {
				                $log.debug('Choose params modal dismissed at: ' + new Date());
				            });
				        };			            
			            
						
					} ]);

	
    angular.module('hb5').controller('HbChooseOneController', ['$scope', '$modalInstance', '$filter', '$log', 'hbUtil', 'elfins', 'columnsDefinition', 'sourcePath', function($scope, $modalInstance, $filter, $log, hbUtil, elfins, columnsDefinition, sourcePath) {

    	// ============================================================
    	// Custom search field used to filter elfins
    	// ============================================================    	
    	// Default ng-grid showFilter box requires an extra click 
    	// to be accessed and is ugly. Let's define our own 
    	
		$scope.search = { text: ""};
    	
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
    			// Obtain configured sourcePath value on selected elfin dynamically
    			$scope.currentSelection = hbUtil.getValueAtPath($scope.selectedElfins[0],sourcePath);
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
               
        
        
    }]);	
	

})();