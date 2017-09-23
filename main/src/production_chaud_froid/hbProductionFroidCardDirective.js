(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='PRODUCTION_FROID'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbProductionFroidCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbProductionFroidCard.html",
			controller: 'HbProductionFroidCardController'
		};
	
    });

})();