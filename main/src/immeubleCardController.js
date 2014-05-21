(function() {

	    angular
			.module('hb5')
			.controller(
					'ImmeubleCardController',
					[
							'$scope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'hbAlertMessages',
							'hbUtil',
							function($scope, GeoxmlService, $modal,
									$routeParams, $location, $log, hbAlertMessages,
									hbUtil) {
    
									$log.debug("    >>>> Using ImmeubleCardController");
							        
							        $scope.constats = null;
							    	
							    	// Watch related to CONSTAT list in the context of elfin of CLASSE IMMEUBLE 
							        // hence the dedicated controller.
							    	$scope.$watch('elfin.IDENTIFIANT.NOM', function() { 

							    		if ($scope.elfin!=null) {
								            var xpathForConstats = "//ELFIN[IDENTIFIANT/COMPTE='"+$scope.elfin.IDENTIFIANT.NOM+"']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: ImmeubleCardController: constatsCollectionId must come from server configuration resource.");
								            var constatsCollectionId = 'G20060920171100001';
								            GeoxmlService.getCollection(constatsCollectionId).getList({"xpath" : xpathForConstats})
												.then(function(elfins) {
														$scope.constats = elfins;
													},
													function(response) {
														var message = "Le chargement des CONSTATs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
							    		}
							    	}, true);        
        
							    } ]);

})();
