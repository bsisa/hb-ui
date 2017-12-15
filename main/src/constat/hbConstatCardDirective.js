(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='CONSTAT'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbConstatCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views-compiled/constat/hbConstatCard.html",
			controller: 'HbConstatCardController'
		};
	
    });

})();