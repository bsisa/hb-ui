(function() {

    /**
     * hb-search directive provides IMMEUBLE quick search similar to 
     * the one found in the Dashboard entry page. It is meant to be
     * accessible on all pages.
     * <div hb-search > </div>
     */
    angular.module('hb5').directive('hbSearch', function () {

    	return {
			restrict: 'A',
			templateUrl : "/assets/views/hbSearch.html",
			controller: 'HbSearchController',
			scope: true
		};
	
    });

})();