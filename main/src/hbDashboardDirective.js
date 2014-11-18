(function() {

	/**
     * Directive specialised to provide HyperBird users a dashboard entry point
     */
    angular.module('hb5').directive('hbDashboard', function () {

		return {
		    restrict: 'A',
			templateUrl : "/assets/views/hbDashboard.html",
			controller: 'HbDashboardController'
		};
	
    });    
    
   
})();