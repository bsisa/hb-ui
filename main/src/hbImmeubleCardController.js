(function() {

	    angular
			.module('hb5')
			.controller(
					'HbImmeubleCardController',
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
									$routeParams, $location, $log, $timeout, hbAlertMessages,
									hbUtil) {
    
									$log.debug("    >>>> Using HbImmeubleCardController");
							        

									// TODO: check hereafter code removal is fine. It moved to its own directive: hb-forme-component
									
									// Manage geographic or schematic mode.
//									$scope.COORDINATE_TYPE = {
//											GEOGRAPHIC : {label: "Géographique", css: "panel-primary"},
//											SCHEMATIC :  {label: "Schématique", css: "panel-success"}
//									};
//									$scope.coordinateType = $scope.COORDINATE_TYPE.GEOGRAPHIC;
									
							        $scope.constats = null;
							        $scope.prestations = null;
							        $scope.surfaces = null;
							    	
							    	// Watch related to CONSTAT list in the context of elfin of CLASSE IMMEUBLE 
							        // hence the dedicated controller.
							    	$scope.$watch('elfin.IDENTIFIANT.NOM', function() { 

							    		if ($scope.elfin!=null) {
								            var xpathForConstats = "//ELFIN[IDENTIFIANT/COMPTE='"+$scope.elfin.IDENTIFIANT.NOM+"']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: constatsCollectionId must come from server configuration resource.");
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
							    	
							    	$scope.$watch('elfin.IDENTIFIANT.OBJECTIF', function() { 

							    		if ($scope.elfin!=null) {
								            var xpathForPrestations = "//ELFIN[starts-with(IDENTIFIANT/OBJECTIF,'"+$scope.elfin.IDENTIFIANT.OBJECTIF+"')]";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: prestationCollectionId must come from server configuration resource.");
								            var prestationsCollectionId = 'G20081113902512302';
								            GeoxmlService.getCollection(prestationsCollectionId).getList({"xpath" : xpathForPrestations})
												.then(function(elfins) {
														$scope.prestations = elfins;
													},
													function(response) {
														var message = "Le chargement des PRESTATIONs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
								            
								            
							    		}
							    		
							    	}, true);
							    	
							    	$scope.$watch('elfin.Id', function() { 

							    		if ($scope.elfin!=null) {
								            
								            var xpathForSurfaces = "//ELFIN[IDENTIFIANT/ORIGINE='"+$scope.elfin.Id+"']";
								            // TODO: constatsCollectionId must come from server configuration resource.
								            $log.debug("TODO: HbImmeubleCardController: surfacesCollectionId must come from server configuration resource.");
								            var surfacesCollectionId = 'G20040930101030013';
								            GeoxmlService.getCollection(surfacesCollectionId).getList({"xpath" : xpathForSurfaces})
												.then(function(elfins) {
														$scope.surfaces = elfins;
													},
													function(response) {
														var message = "Le chargement des SURFACEs a échoué (statut de retour: "+ response.status+ ")";
											            hbAlertMessages.addAlert("danger",message);
													});
							    		}
							    		
							    	}, true);
        
							    } ]);

})();
