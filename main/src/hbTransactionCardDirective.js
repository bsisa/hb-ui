(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='TRANSCATION'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbTransactionCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbTransactionCard.html",
			controller: 'HbTransactionCardController'
		};
	
    });

})();