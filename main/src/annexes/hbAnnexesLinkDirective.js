(function() {


    /**
     * Directive encapsulating logic to either display a direct link to
     * elfin in scope if ELFIN.ANNEXE number count equals 1.
     * 
     * Otherwise displays a link to the elfin itself, possibly with an 
     * option to have ANNEXE tab selected.
     */
    angular.module('hb5').directive('hbAnnexesLink', function () {

    	return {
		    require: '^hbCardContainer',
			restrict: 'A',
		    templateUrl : "/assets/views/hbAnnexesLink.html",
		    controller: 'HbAnnexesLinkController',
		    scope : {
				'elfin' : '=hbAnnexesLinkElfin'   
			}
		};
	
    });

})();