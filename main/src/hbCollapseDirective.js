(function() {


    /**
     * Directive enabling collapse of enclosed element triggered by a button.
     * Note: defining 'initCollapsed' as read only param '@hbCollapseInitCollapsed'
     * make it a string instead of a boolean while keeping it a boolean with =
     */
    angular.module('hb5').directive('hbCollapse', function () {

		return {
		    restrict: 'A',
			scope : {
				'title' : '@hbCollapseTitle', 
				'initCollapsed' : '=hbCollapseInitCollapsed'
			},		    
		    transclude: true,
			templateUrl : "/assets/views/hbCollapse.html",
			controller: 'HbCollapseController'
		};
	
    });	

})();