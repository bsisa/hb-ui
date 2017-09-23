(function() {

	/**
     * Extends common lists layout and logic hb-list-container with CONTRAT 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbContratList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbContratList.html",
			controller: 'HbContratListController'
		};
	
    });    
    
   
})();