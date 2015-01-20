(function() {

    angular.module('hb5').controller('HbWcListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', '$filter', '$timeout', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, $filter, $timeout, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbWcListController called...");
    	
    	// For WC default order is by "Address" stored into alias field 
    	$scope.predicate = 'IDENTIFIANT.ALIAS';
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
		 * Apply wc specific filters and sorting.
		 */
		var filterSortElfins = function(elfins_p, search_p, predicate_p, reverse_p) {
			// Apply prestationListFilter
	    	var filteredSortedElfins = $filter('wcListFilter')(elfins_p, search_p);
	    	filteredSortedElfins = $filter('wcListAnyFilter')(filteredSortedElfins, search_p.text);
	    	// Apply predicate, reverse sorting
	    	filteredSortedElfins = $filter('orderBy')(filteredSortedElfins, predicate_p, reverse_p);
	    	return filteredSortedElfins;
		};
    	
		
		/**
		 * Update filtered collection when search or sorting criteria are modified. 
		 */
    	$scope.$watch('[search,predicate,reverse]', function(newSearch, oldSearch) {
    		//$log.debug(">>>>> HbwcListController search, predicate or reverse UPDATED <<<<< \n" + angular.toJson(newSearch) );
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
    			//$log.debug(">>>>> HbwcListController elfins NOT YET LOADED <<<<<");
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

