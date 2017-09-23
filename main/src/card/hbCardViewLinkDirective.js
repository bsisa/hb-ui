(function() {


    /**
     * hb-card-view-link : Directive encapsulating CSS, icons specific to HyperBird
     * link to access a card details.
     */
    angular.module('hb5').directive('hbCardViewLink', function () {

    	return {
			restrict: 'A',
		    templateUrl : "/assets/views/hbCardViewLink.html",
		    scope: {
		    	hbHref: "@hbHref",
		    	hbTooltip: "@hbTooltip"
	        }
		    
		    
		};
	
    });

})();