(function() {

	/**
     * Extends common lists layout and logic hb-list-container with COMMANDE 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbCommandeList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbCommandeList.html",
			controller: 'HbCommandeListController'
		};
	
    });    
    
   
})();