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

						//$scope.parentElfin = $scope.$parent.elfin;
						
						//$scope.$parent.elfin.PARTENAIRE.FOURNISSEUR.VALUE
						
						// TODO: get this dynamically from HB5 catalogue
						$scope.statusTypes = {
							Vu : "Vu",
							SUIVRE : "SUIVRE"
						};

						$scope.entrepriseActors = null;
						$scope.collaboratorActors = null;
						
						$scope.myProp = "Hello dude 2";
						
						$scope.$watch('myProp', function() { console.log("myProp changed to: " + $scope.myProp); }, true);						
				
						
// ===
		
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
			            
			            GeoxmlService.getCollection(actorsCollectionId).getList({"xpath" : xpathForEntreprises})
							.then(function(entrepriseActors) {
									$scope.entrepriseActors = entrepriseActors;
								},
								function(response) {
									var message = "Le chargement des ACTEURS Entreprise a échoué (statut de retour: "+ response.status+ ")";
						            hbAlertMessages.addAlert("danger",message);
								});
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


    	//$scope.searchText = "";
    	//$scope.entrepriseActors = $filter('filter')(actors, $scope.searchText , false);
    	$scope.actors = actors;
    	
//    	$scope.$watch('$scope.searchText', function() { 
//    		console.log("$scope.searchText changed to " + $scope.searchText);
//    		alert("$scope.searchText changed to " + $scope.searchText);
//    	}, true);       	
//    	
    	
    	
    	$scope.selectedActors = [];    	
    	
    	// ,
//            { field:"IDENTIFIANT.QUALITE", displayName: "Rôle"}
    	//
    	
    	$scope.gridOptions = {
 		        data: 'actors',
 		        columnDefs: [
 		   		            { field:"GROUPE", displayName: "Groupe"}
 		   		],
   		        multiSelect: false,
   		        selectedItems: $scope.selectedActors,
   		        //showColumnMenu: true,
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