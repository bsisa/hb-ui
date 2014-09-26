(function() {

	/**
	 * GeoXml database query service specifically designed at higher level queries than more generic GeoxmlService.
	 * The goal of the current service is to avoid both code and configurations duplication. 
	 */
	
	angular.module('hb5').service('hbQueryService', ['$log','GeoxmlService',function ($log,GeoxmlService) {
		
		/**
		 * Returns a handle to GeoxmlService.getCollection(locationUnitsCollectionId).getList({"xpath" : xpath}) 
		 * function where locationUnitsCollectionId points at ELFIN@CLASSE UNITE_LOCATION (former SURFACE) collection
		 * with optional xpath restriction. 
		 */
		var getLocationUnits = function(xpath) {
			//TODO: check message
	        $log.debug("TODO: hbQueryService: locationUnitsCollectionId should be move to DB_CONSTANTS resource.");
	        var locationUnitsCollectionId = 'G20040930101030013';
	        if ( _.isString(xpath) && xpath.trim().length > 0) { 
	        	return GeoxmlService.getCollection(locationUnitsCollectionId).getList({"xpath" : xpath});
	        } else {
	        	return GeoxmlService.getCollection(locationUnitsCollectionId).getList();
	        }
		};
        
        return {
        	getLocationUnits:getLocationUnits
        };

    }]);
	
})();