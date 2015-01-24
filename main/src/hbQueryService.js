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
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.ACTEUR_ID` identifies collection containing ELFIN objects of CLASSE ACTEUR.  
		 *  @see getList
		 */		
		var getActors = function(xpath) {
	        return getList(HB_COLLECTIONS.ACTOR_ID,xpath);
		};		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.CONTRAT_ID` identifies collection containing ELFIN objects of CLASSE CONTRAT.  
		 *  @see getList
		 */		
		var getContrats = function(xpath) {		
	        return getList(HB_COLLECTIONS.CONTRAT_ID,xpath);
		};		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.IMMEUBLE_ID` identifies collection containing ELFIN objects of CLASSE IMMEUBLE.  
		 *  @see getList  
		 */
		var getImmeubles = function(xpath) {
	        return getList(HB_COLLECTIONS.IMMEUBLE_ID,xpath);
		};		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.UNITE_LOCATIVE_ID` identifies collection containing ELFIN objects of CLASSE UNITE_LOCATIVE.
		 *  @see getList
		 */
		var getLocationUnits = function(xpath) {
	        return getList(HB_COLLECTIONS.LOCATION_UNIT_ID,xpath);
		};
        
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.PRESTATION_ID` identifies collection containing ELFIN objects of CLASSE PRESTATION. 
		 *  @see getList
		 */
		var getPrestations = function(xpath) {
			return getList(HB_COLLECTIONS.PRESTATION_ID,xpath);
		};
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.PRODUCTION_CHALEUR_ID` identifies collection containing ELFIN objects of CLASSE PRODUCTION_CHALEUR.
		 *  @see getList
		 */
		var getProductionChaleurList = function(xpath) {
			return getList(HB_COLLECTIONS.PRODUCTION_CHALEUR_ID,xpath);
		};
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *  
		 * `HB_COLLECTIONS.PRODUCTION_FROID_ID` constant identifies collection containing ELFIN objects of CLASSE PRODUCTION_FROID.
		 *  @see getList
		 */		
		var getProductionFroidList = function(xpath) {
			return getList(HB_COLLECTIONS.PRODUCTION_FROID_ID,xpath);
		};		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "". 
		 * 
		 * `HB_COLLECTIONS.TRANSACTION_ID` constant identifies collection containing ELFIN objects of CLASSE TRANSACTION.
		 *  @see getList
		 */
		var getTransactions = function(xpath) {
			return getList(HB_COLLECTIONS.TRANSACTION_ID,xpath);
		};
        
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *  
		 * `HB_COLLECTIONS.VENTILATION_ID` constant identifies collection containing ELFIN objects of CLASSE VENTILATION.
		 *  @see getList
		 */		
		var getVentilationList = function(xpath) {
			return getList(HB_COLLECTIONS.VENTILATION_ID,xpath);
		};			
		
	
        return {
        	getActors:getActors,
        	getContrats:getContrats,
        	getImmeubles:getImmeubles,
        	getLocationUnits:getLocationUnits,
        	getPrestations:getPrestations,
        	getProductionChaleurList:getProductionChaleurList,
        	getProductionFroidList:getProductionFroidList,
        	getTransactions:getTransactions,
        	getVentilationList:getVentilationList
        };

    }]);
	
})();