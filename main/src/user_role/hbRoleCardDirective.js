(function() {


    /**
     * Directive encapsulating GeoXML ELFIN[@CLASSE='ROLE'] specific view 
     * and behaviour.
     */
    angular.module('hb5').directive('hbRoleCard', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbRoleCard.html",
			controller: 'HbRoleCardController'
		};
	
    });

})();