(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='IMMEUBLE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbImmeubleCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views-compiled/immeuble/hbImmeubleCard.html",
			controller: 'HbImmeubleCardController'
		};
	
    });

})();