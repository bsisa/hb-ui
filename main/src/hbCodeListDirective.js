(function() {

	/**
     * Directive specialised to let different type of codes have 
     * specific list layout depending on XPath restrictions.
     */
    angular.module('hb5').directive('hbCodeList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbCodeList.html",
			controller: 'HbCodeListController'
		};
	
    });    
    
   
})();