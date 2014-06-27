(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='SURFACE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbSurfaceCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbSurfaceCard.html",
			controller: 'HbSurfaceCardController'
		};
	
    });

})();