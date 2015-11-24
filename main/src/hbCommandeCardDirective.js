(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='COMMANDE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbCommandeCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbCommandeCard.html",
			controller: 'HbCommandeCardController'
		};
	
    });

})();