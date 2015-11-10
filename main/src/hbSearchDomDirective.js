(function() {

    /**
     * hb-search-dom directive provides IMMEUBLE quick search similar to 
     * the one found in the Dashboard entry page. It is meant to be
     * accessible on all pages.
     * <div hb-search-dom > </div>
     * Note: Can be the implementation of hbSearch with new end-user behaviour
     * preventing them to see IMMEUBLE other the those belonging to their 
     * current selected `business`
     * The view is strictly the same as for `hb-search`
     */
    angular.module('hb5').directive('hbSearchDom', function () {

    	return {
			restrict: 'A',
			templateUrl : "/assets/views/hbSearch.html",
			controller: 'HbSearchDomController',
			scope: true
		};
	
    });

})();