(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='TRANSACTION'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbTransactionCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views-compiled/transaction/hbTransactionCard.html",
			controller: 'HbTransactionCardController'
		};
	
    });

})();