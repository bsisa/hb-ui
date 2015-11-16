(function() {

    angular.module('hb5').controller('HbImmeubleListController', ['$attrs', '$scope', 'GeoxmlService', 'hbQueryService', '$routeParams', '$log', '$filter', '$timeout', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, hbQueryService, $routeParams, $log, $filter, $timeout, hbAlertMessages, hbUtil) {
    
    	//$log.debug("    >>>> HbImmeubleListController called...");
    	
    	$scope.emptyAccountingGroup = {name: "TOUS", value: ""};

    	// Default order is by "Building management" 
    	$scope.predicate = 'IDENTIFIANT.OBJECTIF';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria 
    	$scope.search = {
    			"active" : "any",
    			"owner" : "",
    			"registerNb" : "",
    			"place" : "",
    			"buildingNb" : "",
    			"address" : "",
    			"text" : "",
    			"GER" :"",
    			"GROUPE_COMPTABLE" : ""
    	};

    	// Initialise general search text with search request parameter if defined.
    	// This is only expected from Dashboard calls.
    	if ($routeParams.search) {
    		$scope.search.text = $routeParams.search; 
    	}
    	
    	// Support for including/excluding retired buildings.
    	if ($routeParams.active) {
    		$scope.search.active = $routeParams.active; 
    	}
    	
    	// Support for GER restriction
    	if ($routeParams.GER) {
    		$scope.search.GER = $routeParams.GER; 
    	}
    	
    	// Support for GROUPE_COMPTABLE restriction
    	if ($routeParams.GROUPE_COMPTABLE) {
    		$scope.search.GROUPE_COMPTABLE = $routeParams.GROUPE_COMPTABLE; 
    	}
    	
    	// Support for IMMEUBLE selection
    	if ($routeParams.source) {
    		$scope.source = $routeParams.source
    		$log.debug("$scope.source = " + $scope.source);
    	}
    	
    	
    	// Init distinct PRESTATION groupe comptable
    	$scope.accountingGroups = new Array();

		hbQueryService.getJsonAccountingGroups().then(function(jsonAccountingGroups) {
			$scope.accountingGroups = jsonAccountingGroups.choices;
		}, function(response) {
        	var errorMessage = "Error with status code " + response.status + " while getting JSON accountingGroups.";
        	$log.error(errorMessage);
        	hbAlertMessages.addAlert("danger","Les groupes comptables n'ont pu être obtenus.");
        });    	
    	
    	

    	/**
    	 * Helper to access to place information by POS instead of array index.
    	 */
    	$scope.getPlace = function(elfin) {
    		var place = hbUtil.getCARByPos(elfin, 1);
    		return (place === undefined) ? "" : place;
    	};
    	
		/**
		 * Proceed to elfin_p collection `immeubleListFilter` filtering and sorting
		 * Moved from page defined filtering: 
		 * immeubleListFilter:search | immeubleListAnyFilter:search.text | orderBy:predicate:reverse
		 * to controller defined filtering to have access to $scope.filteredElfins.length
		 */
		var filterSortElfins = function(elfins_p, search_p, predicate_p, reverse_p) {
			// Apply prestationListFilter
	    	var filteredSortedElfins = $filter('immeubleListFilter')(elfins_p, search_p);
	    	filteredSortedElfins = $filter('immeubleListAnyFilter')(filteredSortedElfins, search_p.text, search_p.active);
	    	// Apply predicate, reverse sorting
	    	filteredSortedElfins = $filter('orderBy')(filteredSortedElfins, predicate_p, reverse_p);
	    	return filteredSortedElfins;
		};
    	
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
    		//$log.debug(">>>>> HbImmeubleListController search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
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
					var gerSearch = {
			    			"active" : "any",
			    			"owner" : "",
			    			"registerNb" : "",
			    			"place" : "",
			    			"buildingNb" : "",
			    			"address" : "",
			    			"text" : "",
			    			"GER" : $scope.search.GER
			    	};
					var gerSearchFilteredElfins = $filter('immeubleListFilter')($scope.elfins, gerSearch);
					$scope.elfinsCount = gerSearchFilteredElfins.length;
				} else {
					//$log.debug(">>>>>> ORIGINAL elfinsCount <<<<<<");
				}
    		} else {
    			//$log.debug(">>>>> HbImmeubleListController elfins NOT YET LOADED <<<<<");
    		}
    	});		
		
    	/**
    	 * Set focus on the list global search field
    	 */
    	var focusOnSearchField = function() {
			$('#globalSearchField').focus();	
		};        
		$timeout(focusOnSearchField, 250, false);    	

		
    }]);


})();

