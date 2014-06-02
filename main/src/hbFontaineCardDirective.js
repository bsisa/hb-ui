(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='FONTAINE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbFontaineCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbFontaineCard.html",
			controller: 'HbFontaineCardController'
		};
	
    });

})();