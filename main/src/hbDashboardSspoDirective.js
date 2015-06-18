(function() {

	/**
     * Directive specialised to provide HyperBird SSPO users a customised dashboard entry point
     */
    angular.module('hb5').directive('hbDashboardSspo', function () {

		return {
		    restrict: 'A',
			templateUrl : "/assets/views/hbDashboardSspo.html",
			controller: 'HbDashboardSspoController'
		};
	
    });    
    
   
})();