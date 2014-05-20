(function() {

	/**
     * Directive allowing common lists layout and logic to be centralised 
     * to hbListContainer.html template and HbListContainerController controller.
     * For instance this allow removing routeProvider routes controllers 
     * definition for all routes to simple lists.
     */
    angular.module('hb5').directive('hbListContainer', function () {

		return {
		    restrict: 'A',
		    transclude: true,
			templateUrl : "/assets/views/hbListContainer.html",
			controller: 'HbListContainerController'
		};
	
    });    
    
   
})();