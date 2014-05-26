(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='ACTEUR'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbActeurCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbActeurCard.html",
			controller: 'HbActeurCardController'
		};
	
    });

})();