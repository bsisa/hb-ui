(function() {

	angular.module('hb5').controller(
					'HbPrestationCardController',
					[
							'$scope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							function($scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil) {

								$log.debug("    >>>> Using HbPrestationCardController");
								
						        $scope.transactions = null;

								
								$scope.$watch('elfin.IDENTIFIANT.OBJECTIF', function() { 

						    		if ($scope.elfin!=null) {
							            
							            var xpathForTransactions = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"']";
							            // TODO: constatsCollectionId must come from server configuration resource.
							            $log.debug("TODO: HbImmeubleCardController: prestationCollectionId must come from server configuration resource.");
							            var transactionsCollectionId = 'G20040930101030011';
							            GeoxmlService.getCollection(transactionsCollectionId).getList({"xpath" : xpathForTransactions})
											.then(function(elfins) {
													$scope.transactions = elfins;
												},
												function(response) {
													var message = "Le chargement des TRANSACTIONs a échoué (statut de retour: "+ response.status+ ")";
										            hbAlertMessages.addAlert("danger",message);
												});
							            
						    		}
						    		
						    	}, true);

							} ]);

})();
