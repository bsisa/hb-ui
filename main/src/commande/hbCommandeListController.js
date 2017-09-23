(function() {

    angular.module('hb5').controller('HbCommandeListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', '$timeout', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, $timeout, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbCommandeListController called...");
    	
    	// COMMANDE default order is by "registerNb" stored in OBJECTIF field 
    	$scope.predicate = 'IDENTIFIANT.OBJECTIF';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria
    	// Model mapping notes: 
    	// registerNb => IDENTIFIANT.OBJECTIF (No SAI of source building - Not unique)
    	// buildingNb => IDENTIFIANT.ORIGINE (No construction of origin building - Should be unique)
    	$scope.search = {
    			"orderNb" : "",
    			"registerNb" : "",
    			"buildingNb" : "",
    			"cfc" : "",
    			"orderType" : "",
    			"date" : "",
    			"amount" : "",
    			"provider_group" : "",
    			"owner_group" : "",    			
    			"description" : "",
    			"text" : ""
    	};

    	// Initialise general search text with search request parameter if defined.
    	// This is only expected from Dashboard calls.
    	if ($routeParams.search) {
    		$scope.search.text = $routeParams.search; 
    	}
    	
		/**
		 * Apply commande specific filters and sorting.
		 */
		var filterSortElfins = function(elfins_p, search_p, predicate_p, reverse_p) {
			// Apply prestationListFilter
	    	var filteredSortedElfins = $filter('commandeListFilter')(elfins_p, search_p);
	    	filteredSortedElfins = $filter('commandeListAnyFilter')(filteredSortedElfins, search_p.text);
	    	// Apply predicate, reverse sorting
	    	filteredSortedElfins = $filter('orderBy')(filteredSortedElfins, predicate_p, reverse_p);
	    	return filteredSortedElfins;
		};
    	
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
    		//$log.debug(">>>>> HbCommandeListController search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
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
    		} else {
    			//$log.debug(">>>>> HbCommandeListController elfins NOT YET LOADED <<<<<");
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

