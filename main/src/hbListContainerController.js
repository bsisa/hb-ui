(function() {

    angular.module('hb5').controller('HbListContainerController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$location', 'hbAlertMessages', 'hbUtil', 'MapService', 'HB_EVENTS', function($attrs, $scope, GeoxmlService, $routeParams, $log, $location, hbAlertMessages, hbUtil, MapService, HB_EVENTS) {
    
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
        
        // ============================================================
        // Global navigation buttons (also found in MenuController and
        // hbCardContainerController).
        // ============================================================        
        
        /**
         * Go home navigation function
         */
    	$scope.home = function() {
    		// Need to encapsulate location path in location url 
    		// to reset any possibly existing search parameters from URL. 
    		$location.url($location.path('/'));
    	};
        
    	/**
    	 * Show/hide map navigation function
    	 */
        $scope.toggleMap = function() {
            $scope.displayMap = MapService.toggleMap();
            $scope.$emit(HB_EVENTS.DISPLAY_MAP_VIEW, $scope.displayMap);
        };
        

        // ============================================================
        // ELFIN collection management
        // ============================================================
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

