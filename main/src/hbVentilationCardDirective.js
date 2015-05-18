(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='VENTILATION'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbVentilationCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbVentilationCard.html",
			controller: 'HbVentilationCardController'
		};
	
    });

})();