(function() {

	/**
     * Extends common lists layout and logic hb-list-container with IMMEUBLE 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbImmeubleList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbImmeubleList.html",
			controller: 'HbImmeubleListController'
		};
	
    });    
    
   
})();