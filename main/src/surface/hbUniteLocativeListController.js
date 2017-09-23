(function() {

    angular.module('hb5').controller('HbUniteLocativeListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', '$timeout', 'hbAlertMessages', 'hbUtil', 'HB_COLLECTIONS', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, $timeout, hbAlertMessages, hbUtil, HB_COLLECTIONS) {
    
    	$log.debug("    >>>> HbUniteLocativeListController called...");
    	
    	// ============================================================
		// Enable search on data linked to location unit entries
    	// ============================================================
		
		/** 
		 * Fetch all buildings (IMMEUBLE)
		 */ 
        GeoxmlService.getCollection(HB_COLLECTIONS.IMMEUBLE_ID).getList()
        .then(function(elfins) {
        	$scope.buildingElfins = elfins;
        }, function(response) {
            var message = "Le chargement des immeubles correspondants aux locataires a échoué (statut de retour: " + response.status + ")";
            hbAlertMessages.addAlert("danger",message);
        });
    	
        /**
         * Find address for location unit
         */
        $scope.getAddress = function (locationUnitOrigine) {
        	var matchingBuilding = _.find($scope.buildingElfins, function(e){ return e.Id === locationUnitOrigine; } );
        	if (matchingBuilding) {
        		return matchingBuilding.IDENTIFIANT.ALIAS;
        	} else {
        		return "";	
        	}
        };    	
        
    	// ============================================================        
        
    	// Default order is by "Building management" 
    	$scope.predicate = 'IDENTIFIANT.OBJECTIF';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria 
    	$scope.search = {
    			"registerNb" : "",
    			"tenant" : "",
    			"owner" : "",
    			"place" : "",
    			"buildingNb" : "",
    			"address" : "",
    			"text" : "",
    			"GER" :""

    	};

    	// Initialise general search text with search request parameter if defined.
    	// This is only expected from Dashboard calls.
    	if ($routeParams.search) {
    		$scope.search.text = $routeParams.search; 
    	}
    	
    	// Support for GER restriction
    	if ($routeParams.GER) {
    		$scope.search.GER = $routeParams.GER; 
    	}    	
    	
		/**
		 * Proceed to elfin_p collection `uniteLocativeListFilter` filtering and sorting
		 * Moved from page defined filtering: 
		 * uniteLocativeListFilter:search | uniteLocativeListAnyFilter:search.text | orderBy:predicate:reverse
		 * to controller defined filtering to have access to $scope.filteredElfins.length
		 */
		var filterSortElfins = function(elfins_p, search_p, predicate_p, reverse_p) {
			// Apply prestationListFilter
	    	var filteredSortedElfins = $filter('uniteLocativeListFilter')(elfins_p, search_p, $scope.buildingElfins);
	    	filteredSortedElfins = $filter('uniteLocativeListAnyFilter')(filteredSortedElfins, search_p.text, $scope.buildingElfins);
	    	// Apply predicate, reverse sorting
	    	filteredSortedElfins = $filter('orderBy')(filteredSortedElfins, predicate_p, reverse_p);
	    	return filteredSortedElfins;
		};
    	
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
    		//$log.debug(">>>>> HbUniteLocativeListController.js search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
    		if ($scope.elfins!=null) {
				$scope.filteredElfins = filterSortElfins($scope.elfins, $scope.search, $scope.predicate, $scope.reverse);
    		}
    	}, true);								
		
		/**
		 * elfins can result from queries taking possibly seconds to tens of seconds to complete.
		 * This requires watching for elfins result availability before computing filteredElfins.length. 
		 */
    	$scope.$watch('elfins', function() { 
    		if ($scope.elfins!=null) {
				$scope.filteredElfins = filterSortElfins($scope.elfins, $scope.search, $scope.predicate, $scope.reverse);		
				
				// If GER restriction applies, override elfinsCount parent scope variable with local computed count.
				if ($scope.search.GER !== "") {
					//$log.debug(">>>>>> RECOMPUTING elfinsCount <<<<<<");
					var gerOnlySearch = {
			    			"registerNb" : "",
			    			"tenant" : "",
			    			"owner" : "",
			    			"place" : "",
			    			"buildingNb" : "",
			    			"address" : "",
			    			"text" : "",
			    			"GER" : $scope.search.GER
			    	};
					var gerSearchFilteredElfins = $filter('uniteLocativeListFilter')($scope.elfins, gerOnlySearch);
					$scope.elfinsCount = gerSearchFilteredElfins.length;
				} else {
					//$log.debug(">>>>>> ORIGINAL elfinsCount <<<<<<");
				}				
				
				
				
    		} else {
    			//$log.debug(">>>>> HbUniteLocativeListController.js elfins NOT YET LOADED <<<<<");
    		}
    	});		
		
    	/**
    	 * Set focus on the list global search field
    	 */
    	var focusOnSearchField = function() {
			$('#globalSearchField').focus();	
		};        
		$timeout(focusOnSearchField, 450, false);       
        
    }]);


})();

