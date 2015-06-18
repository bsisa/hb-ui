(function() {

    angular.module('hb5').controller('HbDashboardSspoController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', '$location', '$timeout', 'HB_COLLECTIONS', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, $location, $timeout, HB_COLLECTIONS, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbDashboardSspoController called at " + new Date());
    	
    	// ============================================================
    	// Section - AMENAGEMENT_SPORTIF
    	// ============================================================    	
    	
    	// ==== Initialisation ========================================
    	var asCollectionId = HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID;
    	
		/**
		 *  Apply amenagementSportifListAnyFilter
		 */
		var filterAmenagementSportifElfins = function(elfins_p, search_p) {
	    	var filteredSortedElfins = $filter('amenagementSportifListAnyFilter')(elfins_p, search_p.text);
	    	return filteredSortedElfins;
		};    	
    	
        // Contains ELFINs JSON Array resulting from the GeoxmlService query   
        $scope.asElfins = null;
        
        // Query all available buildings IMMEUBLE 
        // TODO: move to hbQueryService
        GeoxmlService.getCollection(asCollectionId).getList()
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
				$scope.filteredAsElfins = filterAmenagementSportifElfins($scope.asElfins, $scope.immeubleSearch);										
    		}
    	});	        

    	// ==== Navigation ===========================================

        /**
         * Navigate to end user selected buildings. 
         * Either a list, a card or stay on current page if selection is 0. 
         */
        $scope.listOrViewAs = function() {
        	// 
        	if ($scope.filteredAsElfins.length > 1) {
        		$location.path('/elfin/'+asCollectionId+'/AMENAGEMENT_SPORTIF').search('search', $scope.asSearch.text);
        	} else if ($scope.filteredAsElfins.length == 1) {
        		$location.path('/elfin/'+asCollectionId+'/AMENAGEMENT_SPORTIF/' + $scope.filteredAsElfins[0].Id);	
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
		
    	    	
        
        
    	var focusOnSearchField = function() {
			$('#asSearchTextInput').focus();	
		};        
		
		// TODO: FocusTimeout issue. Find a better solution ? 
		$timeout(focusOnSearchField, 250, false);    	
    	
    	
    }]);


})();

