(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='PRODUCTION_CHALEUR'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbProductionChaleurCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbProductionChaleurCard.html",
			controller: 'HbProductionChaleurCardController'
		};
	
    });

})();