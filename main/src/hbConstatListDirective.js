(function() {

	/**
	 * TODO: comments
     */
    angular.module('hb5').directive('hbConstatList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views-compiled/hbConstatList.html",
			controller: 'HbConstatListController'
		};
	
    });    
    
   
})();