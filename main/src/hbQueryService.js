(function() {

	/**
	 * GeoXml database query service specifically designed at higher 
	 * level queries than more generic GeoxmlService.
	 * The goal of the current service is to avoid both code and 
	 * configurations duplication. 
	 */
	angular.module('hb5').service('hbQueryService', ['$log','GeoxmlService',function ($log,GeoxmlService) {
		
		/**
		 * Returns a handle to function:
		 * GeoxmlService.getCollection(locationUnitsCollectionId).getList({"xpath" : xpath})
		 * Note: Intended to private service usage only.
		 */
		var getList = function (collectionId, xpath) {
	        if ( _.isString(xpath) && xpath.trim().length > 0) { 
	        	return GeoxmlService.getCollection(collectionId).getList({"xpath" : xpath});
	        } else {
	        	return GeoxmlService.getCollection(collectionId).getList();
	        }			
		};
		
		/**
		 * `immeublesCollectionId`: Identifies collection for ELFIN objects of CLASSE IMMEUBLE
		 *  `xpath`: Optional XPath restriction
		 *  @see getList  
		 */
		var getImmeubles = function(xpath) {
	        var immeublesCollectionId = 'G20040930101030005';
	        return getList(immeublesCollectionId,xpath);
		};		
		
		/**
		 * `locationUnitsCollectionId`: Identifies collection for ELFIN objects of CLASSE UNITE_LOCATIVE
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */
		var getLocationUnits = function(xpath) {
			var locationUnitsCollectionId = 'G20040930101030013';
	        return getList(locationUnitsCollectionId,xpath);
		};
		
		/**
		 * `actorsCollectionId`: Identifies collection for ELFIN objects of CLASSE ACTEUR
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */		
		var getActors = function(xpath) {
			var actorsCollectionId = 'G20060401225530100';	
	        return getList(actorsCollectionId,xpath);
		};
        
        return {
        	getActors:getActors,
        	getImmeubles:getImmeubles,
        	getLocationUnits:getLocationUnits
        };

    }]);
	
})();