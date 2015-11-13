(function() {

    angular.module('hb5').controller('HbListContainerController', ['$attrs', '$scope', 'GeoxmlService', 'hbQueryService', '$routeParams', '$log', '$location', 'hbAlertMessages', 'hbUtil', 'MapService', 'HB_COLLECTIONS', 'HB_EVENTS', 'hbPrintService', function($attrs, $scope, GeoxmlService, hbQueryService, $routeParams, $log, $location, hbAlertMessages, hbUtil, MapService, HB_COLLECTIONS, HB_EVENTS, hbPrintService) {
    
    	//$log.debug("    >>>> HbListContainerController called...");
    	
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
    		var activeJob = hbPrintService.getActiveJob();
    		var dashboardUri = hbUtil.getDashboarUri(activeJob);
    		// Redefine searchObj as empty to get rid of sticky URL parameters 
   			// Note former solution $location.url($location.path(dashboardUri)); 
   			// to this problem triggers an unwanted reload of welcome page
    		var searchObj = {};
			$location.search(searchObj).path( dashboardUri );
    	};
        
        // ============================================================
        // Map related functionality
        // ============================================================        
        /**
         *  Default to HIDDEN // TODO: USE CONSTANT: MAP_DISPLAY_TYPE.HIDDEN
         */
        $scope.mapDisplayType = 'HIDDEN';
        
        $scope.switchMapDisplayType = function() {
        	//$log.debug("switchMapDisplayType current : " + $scope.mapDisplayType);
        	$scope.mapDisplayType = MapService.switchMapDisplayType($scope.mapDisplayType);
        	$scope.$emit(HB_EVENTS.DISPLAY_MAP_VIEW, $scope.mapDisplayType !== 'HIDDEN');
        	//$log.debug("switchMapDisplayType new :     " + $scope.mapDisplayType);
        };

        /**
         * Used to allow displaying different layout upon map visibility or not. 
         */
        $scope.isMapToggled = function() {
        	return MapService.isMapDisplayed();
        };
        

        // ============================================================
        // ELFIN collection management
        // ============================================================
        if (GeoxmlService.validateId($scope.collectionId)) {
        	
        	if ($routeParams.xpath) {
        		
        		if ($scope.collectionId === HB_COLLECTIONS.IMMEUBLE_ID) {
        			// ELFIN of 'IMMEUBLE' collection specific call
        	    	hbQueryService.getAugmentedImmeubles($routeParams.xpath)
        			.then(function(augmentedImmeubles) {
	                	if (augmentedImmeubles == null) {
	                		$scope.elfins = augmentedImmeubles;
	                		$scope.elfinsCount = 0;
	                	} else {
	                		$scope.elfins = augmentedImmeubles;
	                		$scope.elfinsCount = augmentedImmeubles.length;
	                	}        				
        			}, function(message) {
        	            hbAlertMessages.addAlert("danger",message);
        	        });	
        		} else {
        			// Generic ELFIN collection call
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
        		}
        	} else if ($attrs.hbElfinClasse) {

        		var elfinClasseXpathRestriction = hbUtil.encodeUriParameter("//ELFIN[@CLASSE='"+$attrs.hbElfinClasse+"']");
        		
        		if ($scope.collectionId === HB_COLLECTIONS.IMMEUBLE_ID) {
        			// ELFIN of 'IMMEUBLE' collection specific call
        	    	hbQueryService.getAugmentedImmeubles(elfinClasseXpathRestriction)
        			.then(function(augmentedImmeubles) {
	                	if (augmentedImmeubles == null) {
	                		$scope.elfins = augmentedImmeubles;
	                		$scope.elfinsCount = 0;
	                	} else {
	                		$scope.elfins = augmentedImmeubles;
	                		$scope.elfinsCount = augmentedImmeubles.length;
	                	}        				
        			}, function(message) {
        	            hbAlertMessages.addAlert("danger",message);
        	        });	
        		} else {
        			// Generic ELFIN collection call        		
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
        		}
        	} else {
        		
        		if ($scope.collectionId === HB_COLLECTIONS.IMMEUBLE_ID) {
        			// ELFIN of 'IMMEUBLE' collection specific call
        	    	hbQueryService.getAugmentedImmeubles()
        			.then(function(augmentedImmeubles) {
	                	if (augmentedImmeubles == null) {
	                		$scope.elfins = augmentedImmeubles;
	                		$scope.elfinsCount = 0;
	                	} else {
	                		$scope.elfins = augmentedImmeubles;
	                		$scope.elfinsCount = augmentedImmeubles.length;
	                	}        				
        			}, function(message) {
        	            hbAlertMessages.addAlert("danger",message);
        	        });	
        		} else {
        			// Generic ELFIN collection call
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
        	}
        } else {
            var message = "L'identifiants de collection (" + $scope.collectionId + " ) n'est pas correct.";
            hbAlertMessages.addAlert("warning",message);
        }
    }]);


})();

