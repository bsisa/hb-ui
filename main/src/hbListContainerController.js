(function() {

    angular.module('hb5').controller('HbListContainerController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbListContainerController called...");
    	
    	if ($routeParams.xpath) {
    		$log.debug("    >>>> XPATH parameter found:  " + $routeParams.xpath);	
    	} else {
    		$log.debug("    >>>> NO XPATH parameter found...");
    	}
    	
    	
    	// Collection id parameter obtained from hb5.config $routeProvider
        $scope.collectionId = $routeParams.collectionId;
        // Contains an ELFINs JSON Array resulting from the GeoxmlService query   
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
        	} else if ($attrs.hbElfinClasse) {

        		var elfinClasseXpathRestriction = hbUtil.encodeUriParameter("//ELFIN[@CLASSE='"+$attrs.hbElfinClasse+"']");
        		
                GeoxmlService.getCollection($scope.collectionId).getList({"xpath" : elfinClasseXpathRestriction})
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

