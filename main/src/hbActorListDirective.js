(function() {

	/**
     * Directive specialised to let different type of actors have 
     * specific list layout depending on XPath restrictions.
     */
    angular.module('hb5').directive('hbActorList', function () {

		return {
			require: '^hbListContainer',
		    restrict: 'A',
			templateUrl : "/assets/views/hbActeurList.html",
			controller: 'HbActorListController'
		};
	
    });    
    
   
})();