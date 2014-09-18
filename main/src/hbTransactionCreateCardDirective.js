(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='TRANSACTION'] specific view 
     * and behaviour for CREATION only. Editing, reading will be done with another 
     * view.
     */
    angular.module('hb5').directive('hbTransactionCreateCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbTransactionCreateCard.html",
			controller: 'HbTransactionCardController'
		};
	
    });

})();