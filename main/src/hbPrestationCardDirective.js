(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='PRESTATION'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbPrestationCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views-compiled/hbPrestationCard.html",
			controller: 'HbPrestationCardController'
		};
	
    });

})();