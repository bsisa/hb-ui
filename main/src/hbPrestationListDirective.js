(function() {

	/**
     * Extends common lists layout and logic hb-list-container with PRESTATION 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbPrestationList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbPrestationList.html",
			controller: 'HbPrestationListController'
		};
	
    });    
    
   
})();