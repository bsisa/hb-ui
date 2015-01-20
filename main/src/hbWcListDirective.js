(function() {

	/**
     * Extends common lists layout and logic hb-list-container with WC 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbWcList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbWcList.html",
			controller: 'HbWcListController'
		};
	
    });    
    
   
})();