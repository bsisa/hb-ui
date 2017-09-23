(function() {

    /**
     * hb-actor-line-converter directive manages bidirectional geoXml.xsd 
     * PERSONType (ACTEUR) to FRACTION.L conversion. 
     * This when L represents a PERSONType. 
     * <hb-actor-line-converter model="elfin.CARACTERISTIQUE.FRACTION.L[n]" />
     */
    angular.module('hb5').directive('hbActorLineConverter', function () {

    	return {
			restrict: 'A',
			priority: 1,
			transclude: true,
			templateUrl : "/assets/views/hbActorLineConverter.html",
			controller: 'HbActorLineConverterController',
			scope: {
				lineModel : '=hbActorLineConverterLineModel',
				actorModel : '=hbActorLineConverterActorModel'
			}
		};
	
    });

})();