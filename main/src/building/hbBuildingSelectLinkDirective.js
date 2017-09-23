(function() {


    /**
     * hb-building-select-link : Directive encapsulating CSS, icons specific to HyperBird
     * link to select a building from the standard building list.
     */
    angular.module('hb5').directive('hbBuildingSelectLink', function () {

    	return {
			restrict: 'A',
			transclude: true,
		    templateUrl : "/assets/views/hbBuildingSelectLink.html",
		    scope: {
		    	source: "=hbBuildingSelectSource",
		    	target: "=hbBuildingSelectTarget"
	        }
		    
		    
		};
	
    });

})();