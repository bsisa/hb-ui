(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='SURFACE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbSurfaceCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views-compiled/surface/hbSurfaceCard.html",
			controller: 'HbSurfaceCardController'
		};
	
    });

})();