(function() {

	/**
     * Directive allowing common card header row layout to be centralised 
     * together with inclusion of custom validation message extension via 
     * transclusion.
     */
    angular.module('hb5').directive('hbCardHeader', function () {

		return {
			require: '^hbCardContainer',
		    restrict: 'A',
		    transclude: true,
			templateUrl : "/assets/views/hbCardHeader.html"
		};

    });    
    
   
})();