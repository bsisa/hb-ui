(function() {


    /**
     * Directive encapsulating ELFIN.ANNEXE specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbAnnexesComponent', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbAnnexesComponent.html",
			controller: 'HbAnnexesComponentController'
		};
	
    });

})();