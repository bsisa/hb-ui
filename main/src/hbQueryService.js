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
		 * `actorsCollectionId`: Identifies collection for ELFIN objects of CLASSE ACTEUR
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */		
		var getActors = function(xpath) {
			var actorsCollectionId = 'G20060401225530100';	
	        return getList(actorsCollectionId,xpath);
		};		
		
		/**
		 * `contratsCollectionId`: Identifies collection for ELFIN objects of CLASSE CONTRAT
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */		
		var getContrats = function(xpath) {		
			var contratsCollectionId = 'G20081113902512301';
	        return getList(contratsCollectionId,xpath);
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
		 * `prestationsCollectionId`: Identifies collection for ELFIN objects of CLASSE PRESTATION
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */
		var getPrestations = function(xpath) {
			var prestationsCollectionId = 'G20081113902512302';
			return getList(prestationsCollectionId,xpath);
		};
		
		/**
		 * `transactionsCollectionId`: Identifies collection for ELFIN objects of CLASSE TRANSACTION
		 *  `xpath`: Optional XPath restriction
		 *  @see getList
		 */
		var getTransactions = function(xpath) {
			var transactionsCollectionId = 'G20040930101030011';
			return getList(transactionsCollectionId,xpath);
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