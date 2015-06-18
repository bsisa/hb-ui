(function() {

    /**
     * hb-search-sspo directive provides AMENAGEMENT_SPORTIF quick search similar to 
     * the one found in the DashboardSspo entry page. It is meant to be
     * accessible from every page.
     * <div hb-search-sspo > </div>
     */
    angular.module('hb5').directive('hbSearchSspo', function () {

    	return {
			restrict: 'A',
			templateUrl : "/assets/views/hbSearchSspo.html",
			controller: 'HbSearchSspoController',
			scope: true
		};
	
    });

})();