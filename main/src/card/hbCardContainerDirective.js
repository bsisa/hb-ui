(function() {


    /**
     * Directive allowing card buttons group and head properties layout reuse (template)
     * as well as related card buttons logic.
     */
    angular.module('hb5').directive('hbCardContainer', function () {

		return {
		    restrict: 'A',
		    transclude: true,
			templateUrl : "/assets/views-compiled/card/hbCardContainer.html",
			controller: 'HbCardContainerController'
		};
	
    });	

})();