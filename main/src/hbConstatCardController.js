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

	
    angular.module('hb5').controller('HbChooseOneController', ['$scope', '$modalInstance', '$filter', 'elfins', 'columnsDefinition', function($scope, $modalInstance, $filter, elfins, columnsDefinition) {

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
    	
    	
		// Contains the result of user selection. 
		// While gridOptions multiSelect attribute equals false 
		// the array will only be zero or one element. 
    	$scope.selectedElfins = [];    	
    	
    	// ng-grid options. See ng-grid API Documentation for details.
    	$scope.gridOptions = {
 		        data: 'elfins',
 		        columnDefs: columnsDefinition,
 		   	// Grid columns definition with roles
 		   	//  columnDefs: [
            //              { field:"GROUPE", displayName: "Groupe"},
            //              { field:"IDENTIFIANT.QUALITE", displayName: "Rôle"}
 		   	//  ],
   		        multiSelect: false,
   		        selectedItems: $scope.selectedElfins,
   		        showColumnMenu: false, // Useful for grouping 
   		        showFilter: false, // Ugly look, redefine our own search field
   		        filterOptions : { filterText: '', useExternalFilter: false }
   		    };    	
    	
    	$('#searchTextInput').focus();
    	
    	
        $scope.ok = function () {
            $modalInstance.close($scope.selectedElfins);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);	
	

})();