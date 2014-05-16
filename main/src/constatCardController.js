(function() {

	angular.module('hb5').controller(
			'ConstatCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, hbAlertMessages, hbUtil) {

						console.log("    >>>> Using ConstatCardController");

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
				        $scope.chooseActor = function (target, actors) {
				        	
				        	console.log(">>>> ON CHOOSE :: target = : " + target);
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/chooseActor.html',
				                scope: $scope,
				                controller: 'ChooseActorCtroller',
				                resolve: {
				                	actors: function () {
				                    	return actors;
				                    }               				                    
				                },                
				                backdrop: 'static'
				            });

				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (selectedActors) {
				            	if (selectedActors && selectedActors.length > 0) {
				            		console.log("Selected actor GROUPE is: " + selectedActors[0].GROUPE);
				            		console.log(">>>> BEFORE UPDATE :: target = : " + target);
				            		target = selectedActors[0].GROUPE;
				            		console.log(">>>> AFTER UPDATE  :: target = : " + target);
				            		//TODO: solve scope access to elfin
				            		//$scope.$parent.elfin.PARTENAIRE.FOURNISSEUR.VALUE = selectedActors[0].GROUPE;
				            		//console.log(">>>> UGLY UPDATE HACK :: $scope.$parent.$parent.elfin.PARTENAIRE.FOURNISSEUR.VALUE = : " + $scope.$parent.elfin.PARTENAIRE.FOURNISSEUR.VALUE);
				            	} else {
				            		console.log("No selected actor returned!!!");				            		
				            	}
				            	
				            }, function () {
				                console.log('Choose params modal dismissed at: ' + new Date());
				            });
				        };						
						

				        //   /api/melfin/G20060401225530100?xpath=//ELFIN[IDENTIFIANT/QUALITE='Entreprise']
			            var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
			            //var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']";
			            var xpathForCollaborator = "//ELFIN[IDENTIFIANT/QUALITE!='Entreprise']";
			            // TODO: actorsCollectionId must come from server configuration resource.
			            console.log("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
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

	
    angular.module('hb5').controller('ChooseActorCtroller', ['$scope', '$modalInstance', '$filter', 'actors', function($scope, $modalInstance, $filter, actors) {

    	// ============================================================
    	// Custom search field used to filter actors
    	// ============================================================    	
    	// Default ng-grid showFilter box requires an extra click 
    	// to be accessed and is ugly. Let's define our own 
		$scope.search = { text: ""};
    	$scope.actors = $filter('filter')(actors, $scope.search.text , false);
		
		$scope.$watch('search.text', function() { 
			$scope.gridOptions.filterOptions.filterText = $scope.search.text;
			}, true);
    	// ============================================================
    	
    	
		// Contains the result of user selection. 
		// While gridOptions multiSelect attribute equals false 
		// the array will only be zero or one element. 
    	$scope.selectedActors = [];    	
    	
    	// ng-grid options. See ng-grid API Documentation for details.
    	$scope.gridOptions = {
 		        data: 'actors',
 		        columnDefs: [
 		   		            { field:"GROUPE", displayName: "Groupe"}
 		   		],
 		   	// Grid columns definition with roles
 		   	//  columnDefs: [
            //              { field:"GROUPE", displayName: "Groupe"},
            //              { field:"IDENTIFIANT.QUALITE", displayName: "Rôle"}
 		   	//  ],
   		        multiSelect: false,
   		        selectedItems: $scope.selectedActors,
   		    //  showColumnMenu: true, // Useful for groupping 
   		    //  showFilter: true, // Ugly look, redefine our own search field
   		        filterOptions : { filterText: '', useExternalFilter: false }
   		    };    	
    	
        $scope.ok = function () {
            $modalInstance.close($scope.selectedActors);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);	
	

})();