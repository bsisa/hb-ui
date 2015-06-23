(function() {

	/**
     * Directive specialised to provide HyperBird SDS users a customised dashboard entry point
     */
    angular.module('hb5').directive('hbDashboardSds', function () {

		return {
		    restrict: 'A',
			templateUrl : "/assets/views/hbDashboardSds.html",
			controller: 'HbDashboardSdsController'
		};
	
    });    
    
   
})();