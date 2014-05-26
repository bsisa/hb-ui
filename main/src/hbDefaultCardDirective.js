(function() {


    /**
     * Fallback directive encapsulating GeoXML view and behaviour 
     * for ELFIN@CLASSE not having a dedicated directive. 
     */
    angular.module('hb5').directive('hbDefaultCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbDefaultCard.html",
			controller: 'HbDefaultCardController'
		};
	
    });

})();