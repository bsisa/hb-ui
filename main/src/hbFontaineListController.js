(function() {

    angular.module('hb5').controller('HbFontaineListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbFontaineListController called...");
    	
    	// Default order is by "Building management" 
    	$scope.predicate = 'IDENTIFIANT.OBJECTIF';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria 
    	$scope.search = {
    			"objectif" : "",
    			"nom" : "",
    			"alias" : "",
    			"remark" : "",
    			"text" : ""
    	};

    	// Initialise general search text with search request parameter if defined.
    	// This is only expected from Dashboard calls.
    	if ($routeParams.search) {
    		$scope.search.text = $routeParams.search; 
    	}
    	
		/**
		 * Apply fontaine specific filters and sorting.
		 */
		var filterSortElfins = function(elfins_p, search_p, predicate_p, reverse_p) {
			// Apply prestationListFilter
	    	var filteredSortedElfins = $filter('fontaineListFilter')(elfins_p, search_p);
	    	filteredSortedElfins = $filter('fontaineListAnyFilter')(filteredSortedElfins, search_p.text);
	    	// Apply predicate, reverse sorting
	    	filteredSortedElfins = $filter('orderBy')(filteredSortedElfins, predicate_p, reverse_p);
	    	return filteredSortedElfins;
		};
    	
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
    		//$log.debug(">>>>> HbFontaineListController search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
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
    			//$log.debug(">>>>> HbFontaineListController elfins NOT YET LOADED <<<<<");
    		}
    	});		
		
		
    	
    }]);


})();

