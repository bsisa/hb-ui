(function() {

	/**
     * Extends common lists layout and logic hb-list-container with HORLOGE 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbHorlogeList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbHorlogeList.html",
			controller: 'HbHorlogeListController'
		};
	
    });    
    
   
})();