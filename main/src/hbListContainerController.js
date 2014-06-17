(function() {

    angular.module('hb5').controller('HbListContainerController', ['$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', function($scope, GeoxmlService, $routeParams, $log, hbAlertMessages) {
    
    	$log.debug("    >>>> HbListContainerController called...");
    	
    	if ($routeParams.xpath) {
    		$log.debug("    >>>> XPATH parameter found:  " + $routeParams.xpath);	
    	} else {
    		$log.debug("    >>>> NO XPATH parameter found...");
    	}
    	
    	
    	// Collection id parameter obtained from hb5.config $routeProvider
        $scope.collectionId = $routeParams.collectionId;
        // Contains a JSON Array of ELFINs resulting of the GeoxmlService query   
        $scope.elfins = null;
        $scope.elfinsCount = null;
        
        if (GeoxmlService.validateId($scope.collectionId)) {
        	if ($routeParams.xpath) {
                GeoxmlService.getCollection($scope.collectionId).getList({"xpath" : $routeParams.xpath})
                .then(function(elfins) {
                	if (elfins == null) {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = 0;
                	} else {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = elfins.length;
                	}
                }, function(response) {
                    var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
                    hbAlertMessages.addAlert("danger",message);
                });        		
        	} else {
                GeoxmlService.getCollection($scope.collectionId).getList()
                .then(function(elfins) {
                	if (elfins == null) {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = 0;
                	} else {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = elfins.length;
                	}
                }, function(response) {
                    var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
                    hbAlertMessages.addAlert("danger",message);
                });	
        	}
        } else {
            var message = "L'identifiants de collection (" + $scope.collectionId + " ) n'est pas correct.";
            hbAlertMessages.addAlert("warning",message);
        }
    }]);


})();

