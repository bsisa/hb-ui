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

						$scope.actors = null;
						
// ===
		
				        /**
				         * Modal panel to select an actor.
				         */
				        $scope.chooseActor = function (actors) {
				        	
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
				            	} else {
				            		console.log("No selected actor returned!!!");				            		
				            	}
				            	
				            }, function () {
				                console.log('Choose params modal dismissed at: ' + new Date());
				            });
				        };						
						
// ===
						
				        
//				        /api/melfin/G20060401225530100?xpath=//ELFIN[IDENTIFIANT/QUALITE='Entreprise']
						
				        
			            var xpathForEntreprises = "//ELFIN[IDENTIFIANT/QUALITE='Entreprise']";
			            // TODO: actorsCollectionId must come from server configuration resource.
			            console.log("TODO: ConstatCardController: actorsCollectionId must come from server configuration resource.");
			            var actorsCollectionId = 'G20060401225530100';
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForEntreprises})
							.then(function(actors) {
									$scope.actors = actors;
								},
								function(response) {
									var message = "Le chargement des ACTEURS a échoué (statut de retour: "+ response.status+ ")";
						            hbAlertMessages.addAlert("danger",message);
								});				        
						
					} ]);
	
	
    angular.module('hb5').controller('ChooseActorCtroller', ['$scope', '$modalInstance', 'actors', function($scope, $modalInstance, actors) {


    	$scope.actors = actors;
    	$scope.selectedActors = [];    	
    	
    	
    	
    	$scope.gridOptions = {
 		        data: 'actors',
 		        columnDefs: [
 		   		            { field:"GROUPE", displayName: "Groupe"},
 		   		            { field:"IDENTIFIANT.QUALITE", displayName: "Rôle"}
 		   		],
   		        multiSelect: false,
   		        selectedItems: $scope.selectedActors,
   		        showFilter: true,
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