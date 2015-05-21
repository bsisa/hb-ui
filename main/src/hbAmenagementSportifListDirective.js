(function() {

	/**
     * Extends common lists layout and logic hb-list-container with AMENAGEMENT_SPORTIF 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbAmenagementSportifList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbAmenagementSportifList.html",
			controller: 'HbAmenagementSportifListController'
		};
	
    });    
    
   
})();