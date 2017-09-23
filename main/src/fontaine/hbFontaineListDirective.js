(function() {

	/**
     * Extends common lists layout and logic hb-list-container with FONTAINE 
     * specific view AND logic. 
     */
    angular.module('hb5').directive('hbFontaineList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbFontaineList.html",
			controller: 'HbFontaineListController'
		};
	
    });    
    
   
})();