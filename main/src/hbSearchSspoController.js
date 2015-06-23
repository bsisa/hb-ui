(function() {

    angular.module('hb5').controller('HbSearchSdsController', ['$scope','$log', '$filter', '$location', 'HB_COLLECTIONS', 'hbAlertMessages', 'hbQueryService', function($scope, $log, $filter, $location, HB_COLLECTIONS, hbAlertMessages, hbQueryService) {
    
    	//$log.debug("    >>>> HbSearchSdsController called at " + new Date());
    	
    	// ============================================================
    	// Section - AMENAGEMENT_SPORTIF
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	
		/**
		 *  Apply amenagementSportifListAnyFilter
		 */
		var filterAmenagementSportifElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	
    	
        // Contains ELFINs JSON Array resulting from the hbQueryService   
        $scope.asElfins = null;
        
        // Query all available AMENAGEMENT_SPORTIF 
        hbQueryService.getAmenagementSportifs()
	        .then(function(asElfins) {
        		$scope.asElfins = asElfins;
        		$scope.filteredAsElfins = filterAmenagementSportifElfins($scope.asElfins, $scope.asSearch);
	        }, function(response) {
	            var message = "Le chargement des immeubles a échoué (statut de retour: " + response.status + ")";
	            hbAlertMessages.addAlert("danger",message);
	        });	
    	
		/**
		 * asElfins result is loaded asynchronously.
		 */
    	$scope.$watch('asElfins', function() { 
    		if ($scope.asElfins!=null) {
				$scope.filteredAsElfins = filterAmenagementSportifElfins($scope.asElfins, $scope.asSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected buildings. 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewAs = function() {
    		// Clean up any former irrelevant sticky search parameter such as ?xpath=...
    		$location.search({});         	
        	if ($scope.filteredAsElfins.length > 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF').search('search', $scope.asSearch.text);
        	} else if ($scope.filteredAsElfins.length == 1) {
        		$location.path('/elfin/'+HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsElfins[0].Id);	
        	}
        };                

        
    	// ==== End user search and related listener ==================        
        /** User entered AMENAGEMENT_SPORTIF search criterion */
        $scope.asSearch = { "text" : "" };
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('asSearch', function(newSearch, oldSearch) {
    		if ($scope.asElfins!=null) {
				$scope.filteredAsElfins = filterAmenagementSportifElfins($scope.asElfins, $scope.asSearch);
    		}
    	}, true);								
			
    	// ============================================================
        // AMENAGEMENT_SPORTIF search - end
    	// ============================================================    	    	
    	
    	
    	
    	
    }]);


})();

