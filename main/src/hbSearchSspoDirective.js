(function() {

    /**
     * hb-search-sds directive provides AMENAGEMENT_SPORTIF quick search similar to 
     * the one found in the DashboardSds entry page. It is meant to be
     * accessible from every page.
     * <div hb-search-sds > </div>
     */
    angular.module('hb5').directive('hbSearchSds', function () {

    	return {
			restrict: 'A',
			templateUrl : "/assets/views/hbSearchSds.html",
			controller: 'HbSearchSdsController',
			scope: true
		};
	
    });

})();