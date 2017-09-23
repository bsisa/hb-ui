(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='AMENAGEMENT_SPORTIF'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbAmenagementSportifCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbAmenagementSportifCard.html",
			controller: 'HbAmenagementSportifCardController'
		};
	
    });

})();