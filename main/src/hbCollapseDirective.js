(function() {


    /**
     * Directive enabling collapse of enclosed element triggered by a button.
     */
    angular.module('hb5').directive('hbCollapse', function () {

		return {
		    restrict: 'A',
		    transclude: true,
			templateUrl : "/assets/views/hbCollapse.html",
			controller: 'HbCollapseController'
		};
	
    });	

})();