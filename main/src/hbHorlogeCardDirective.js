(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='HORLOGE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbHorlogeCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbHorlogeCard.html",
			controller: 'HbHorlogeCardController'
		};
	
    });

})();