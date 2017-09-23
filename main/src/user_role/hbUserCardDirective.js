(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='USER'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbUserCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbUserCard.html",
			controller: 'HbUserCardController'
		};
	
    });

})();