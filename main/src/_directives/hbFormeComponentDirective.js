(function() {


    /**
     * Directive encapsulating ELFIN.FORME specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbFormeComponent', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbFormeComponent.html",
			controller: 'HbFormeComponentController'
		};
	
    });

})();