(function() {

	/**
	 * GeoXml database query service specifically designed at higher 
	 * level queries than more generic GeoxmlService.
	 * The goal of the current service is to avoid both code and 
	 * configurations duplication. 
	 */
	angular.module('hb5').service('hbQueryService', ['$log','GeoxmlService', 'HB_COLLECTIONS',function ($log,GeoxmlService,HB_COLLECTIONS) {
		
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
		 * `actorsCollectionId`: Identifies collection for ELFIN objects of CLASSE ACTEUR
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */		
		var getActors = function(xpath) {
	        return getList(HB_COLLECTIONS.ACTOR_ID,xpath);
		};		
		
		/**
		 * `contratsCollectionId`: Identifies collection for ELFIN objects of CLASSE CONTRAT
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */		
		var getContrats = function(xpath) {		
	        return getList(HB_COLLECTIONS.CONTRAT_ID,xpath);
		};		
		
		/**
		 * `immeublesCollectionId`: Identifies collection for ELFIN objects of CLASSE IMMEUBLE
		 *  `xpath`: Optional XPath restriction
		 *  @see getList  
		 */
		var getImmeubles = function(xpath) {
	        return getList(HB_COLLECTIONS.IMMEUBLE_ID,xpath);
		};		
		
		/**
		 * `locationUnitsCollectionId`: Identifies collection for ELFIN objects of CLASSE UNITE_LOCATIVE
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */
		var getLocationUnits = function(xpath) {
	        return getList(HB_COLLECTIONS.LOCATION_UNIT_ID,xpath);
		};
        
		/**
		 * `prestationsCollectionId`: Identifies collection for ELFIN objects of CLASSE PRESTATION
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */
		var getPrestations = function(xpath) {
			return getList(HB_COLLECTIONS.PRESTATION_ID,xpath);
		};
		
		/**
		 * `transactionsCollectionId`: Identifies collection for ELFIN objects of CLASSE TRANSACTION
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */
		var getTransactions = function(xpath) {
			return getList(HB_COLLECTIONS.TRANSACTION_ID,xpath);
		};
        
	
        return {
        	getActors:getActors,
        	getContrats:getContrats,
        	getImmeubles:getImmeubles,
        	getLocationUnits:getLocationUnits,
        	getPrestations:getPrestations,
        	getTransactions:getTransactions
        };

    }]);
	
})();