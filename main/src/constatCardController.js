(function() {

	angular.module('hb5').controller(
			'ConstatCardController',
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

						$scope.entrepriseActors = null;
						$scope.collaboratorActors = null;
						

						/**
				         * Modal panel to select an actor.
				         */
				        $scope.chooseActor = function (targetElfin, targetPath, elfins, sourcePath) {
				        	
				        	$log.debug(">>>> ON CHOOSE :: targetElfin = : " + targetElfin.Id);
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/chooseActor.html',
				                scope: $scope,
				                controller: 'ChooseActorCtroller',
				                resolve: {
				                	elfins: function () {
				                    	return elfins;
				                    }               				                    
				                },                
				                backdrop: 'static'
				            });

				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedElfins) {
				            	if (selectedElfins && selectedElfins.length > 0) {
				            		//hbUtil.applyPath(targetElfin,targetPath,selectedElfins[0].GROUPE);
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
			            
			            
						
					} ]);

	
    angular.module('hb5').controller('ChooseActorCtroller', ['$scope', '$modalInstance', '$filter', 'elfins', function($scope, $modalInstance, $filter, elfins) {

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
 		        columnDefs: [
 		   		            { field:"GROUPE", displayName: "Groupe"}
 		   		],
 		   	// Grid columns definition with roles
 		   	//  columnDefs: [
            //              { field:"GROUPE", displayName: "Groupe"},
            //              { field:"IDENTIFIANT.QUALITE", displayName: "Rôle"}
 		   	//  ],
   		        multiSelect: false,
   		        selectedItems: $scope.selectedElfins,
   		        showColumnMenu: true, // Useful for groupping 
   		        showFilter: true, // Ugly look, redefine our own search field
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