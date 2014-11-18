(function() {

	/**
     * Extends common lists layout and logic hb-list-container with SURFACE => UNITE_LOCATIVE 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbUniteLocativeList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbUniteLocativeList.html",
			controller: 'HbUniteLocativeListController'
		};
	
    });    
    
   
})();