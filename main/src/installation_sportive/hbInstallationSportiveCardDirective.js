(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='INSTALLATION_SPORTIVE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbInstallationSportiveCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbInstallationSportiveCard.html",
			controller: 'HbInstallationSportiveCardController'
		};
	
    });

})();