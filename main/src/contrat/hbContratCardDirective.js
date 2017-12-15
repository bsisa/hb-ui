(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='CONTRAT'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbContratCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views-compiled/contrat/hbContratCard.html",
			controller: 'HbContratCardController'
		};
	
    });

})();