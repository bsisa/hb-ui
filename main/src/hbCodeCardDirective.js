(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='CODE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbCodeCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbCodeCard.html",
			controller: 'HbCodeCardController'
		};
	
    });

})();