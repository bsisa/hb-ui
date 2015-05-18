(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='CITERNE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbCiterneCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbCiterneCard.html",
			controller: 'HbCiterneCardController'
		};
	
    });

})();