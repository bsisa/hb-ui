(function() {

	/**
     * Directive specialised to provide HyperBird DOM users a customised dashboard entry point
     */
    angular.module('hb5').directive('hbDashboardDom', function () {

		return {
		    restrict: 'A',
			templateUrl : "/assets/views/hbDashboardDom.html",
			controller: 'HbDashboardDomController'
		};
	
    });    
    
   
})();