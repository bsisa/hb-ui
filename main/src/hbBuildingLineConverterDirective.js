(function() {

    /**
     * hb-building-line-converter directive manages unidirectional geoXml.xsd 
     * FRACTION.L.C entries to ELFIN@CLASSE='IMMEUBLE' object conversion. 
     * This when L.C is in the form C@POS='2' contains ID_G and C@POS='3' contains Id  
     * 
     * <div hb-building-line-converter hb-building-line-converter-line-model="elfin.CARACTERISTIQUE.FRACTION.L[n]" hb-building-line-converter-building-elfin="theBuildingElfin" >
     *   {{theBuildingElfin.IDENTIFIANT.OBJECTIF}} ...
     * </div>
     */
    angular.module('hb5').directive('hbBuildingLineConverter', function () {

    	return {
			restrict: 'A',
			priority: 1,
			transclude: true,
			templateUrl : "/assets/views/hbBuildingLineConverter.html",
			controller: 'HbBuildingLineConverterController',
			scope: {
				lineModel : '=hbBuildingLineConverterLineModel',
				buildingElfin : '=hbBuildingLineConverterBuildingElfin'
			}
		};
	
    });

})();