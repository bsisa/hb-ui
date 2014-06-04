(function() {


    /**
     * Directive enabling collapse of enclosed element triggered by a button.
     */
    angular.module('hb5').directive('hbCollapse', function () {

		return {
		    restrict: 'A',
		    scope: true,
		    transclude: true,
			templateUrl : "/assets/views/hbCollapse.html",
			controller: 'HbCollapseController'
		};
	
    });	

})();