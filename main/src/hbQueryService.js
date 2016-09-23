(function() {

	/**
	 * GeoXml database query service specifically designed at higher 
	 * level queries than more generic GeoxmlService.
	 * The goal of the current service is to avoid both code and 
	 * configurations duplication. 
	 */
	angular.module('hb5').service('hbQueryService', ['$log','GeoxmlService', 'HB_COLLECTIONS', '$q',function ($log,GeoxmlService,HB_COLLECTIONS, $q) {
		
		/**
		 * Returns a handle to function:
		 * GeoxmlService.getCollection(collectionId).getList({"xpath" : xpath})
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
		 * `HB_COLLECTIONS.ABRIBUS_ID` identifies collection containing ELFIN objects of CLASSE ABRIBUS.  
		 *  @see getList
		 */		
		var getAbribusList = function(xpath) {
	        return getList(HB_COLLECTIONS.ABRIBUS_ID,xpath);
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
		 * `HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID` identifies collection containing ELFIN objects of CLASSE AMENAGEMENT_SPORTIF.  
		 *  @see getList
		 */		
		var getAmenagementSportifs = function(xpath) {
	        return getList(HB_COLLECTIONS.AMENAGEMENT_SPORTIF_ID,xpath);
		};			
				
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *  
		 * `HB_COLLECTIONS.CITERNE_ID` constant identifies collection containing ELFIN objects of CLASSE CITERNE.
		 *  @see getList
		 */		
		var getCiterneList = function(xpath) {
			return getList(HB_COLLECTIONS.CITERNE_ID,xpath);
		};			

		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.CODE_ID` identifies collection containing ELFIN objects of CLASSE CODE.  
		 *  @see getList
		 */		
		var getCodes = function(xpath) {		
	        return getList(HB_COLLECTIONS.CODE_ID,xpath);
		};
		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.COMMANDE_ID` identifies collection containing ELFIN objects of CLASSE COMMANDE.  
		 *  @see getList
		 */		
		var getCommandes = function(xpath) {		
	        return getList(HB_COLLECTIONS.COMMANDE_ID,xpath);
		};			


		/**
		 * Prototype (test) function making use of server side XQuery for improved control and performance. 
		 */
		var getCommandesForSource = function(source) {
	        return GeoxmlService.getXqueryResults("get_COMMANDE_list_for_SOURCE.xq").getList({"source" : source, "format" : "json" });
		};

		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.CONSTAT_ID` identifies collection containing ELFIN objects of CLASSE CONSTAT.  
		 *  @see getList
		 */		
		var getConstats = function(xpath) {		
	        return getList(HB_COLLECTIONS.CONSTAT_ID,xpath);
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
		 * `HB_COLLECTIONS.EQUIPEMENT_ID` identifies collection containing ELFIN objects of CLASSE EQUIPEMENT.  
		 *  @see getList
		 */		
		var getEquipementList = function(xpath) {		
	        return getList(HB_COLLECTIONS.EQUIPEMENT_ID,xpath);
		};	
		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.EQUIPEMENT_SPORTIF_ID` identifies collection containing ELFIN objects of CLASSE EQUIPEMENT_SPORTIF.  
		 *  @see getList
		 */
		var getEquipementsSportifs = function(xpath) {
			return getList(HB_COLLECTIONS.EQUIPEMENT_SPORTIF_ID,xpath);
		};
		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.FONTAINE_ID` identifies collection containing ELFIN objects of CLASSE FONTAINE_ID.  
		 *  @see getList
		 */
		var getFontaines = function(xpath) {
			return getList(HB_COLLECTIONS.FONTAINE_ID,xpath);
		};	
		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.HORLOGE_ID` identifies collection containing ELFIN objects of CLASSE HORLOGE.  
		 *  @see getList
		 */
		var getHorlogeList = function(xpath) {
			return getList(HB_COLLECTIONS.HORLOGE_ID,xpath);
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
		 * `HB_COLLECTIONS.IMMEUBLE_ID` identifies collection containing ELFIN objects of CLASSE IMMEUBLE.  
		 *  @see getList  
		 */
		var getImmeubles = function(xpath) {
	        return getList(HB_COLLECTIONS.IMMEUBLE_ID,xpath);
		};			

		
		/**
		 *  Deferred list of immeubles with added GROUPE_COMPTABLE property from current year PRESTATION
		 * 
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.IMMEUBLE_ID` identifies collection containing ELFIN objects of CLASSE IMMEUBLE.  
		 *  @see getList
		 */
		var getAugmentedImmeubles = function(immeublesXpath) {
	        
			$log.debug(">>>> getAugmentedImmeubles - start");
			
			var deferred = $q.defer();
			
		    getImmeubles(immeublesXpath)
	        .then(function(immeubleElfins) {
	        	
	        	$log.debug(">>>> getAugmentedImmeubles - immeubleElfins.length = " + immeubleElfins.length);
	        	
	        	// Get all current year PRESTATIONs at once (most efficient)
	        	var currentYear = moment().year();
	        	var prestationsXpath = "//ELFIN[@CLASSE='PRESTATION' and IDENTIFIANT/DE='"+currentYear+"']";
	        	getPrestations(prestationsXpath).then(function(prestationElfins) {
	        		$log.debug(">>>> getAugmentedImmeubles - prestationElfins.length = " + prestationElfins.length);
					var augmentedImmeubles = new Array();
					for (var i = 0; i < immeubleElfins.length; i++) {
						var currImmeuble = immeubleElfins[i];
						//$log.debug(">>>> getAugmentedImmeubles - immeubleElfins[i].Id = " + currImmeuble.Id);						
						//var xpathForPrestations = "//ELFIN[@CLASSE='PRESTATION' and PARTENAIRE/PROPRIETAIRE/@NOM='"+currImmeuble.PARTENAIRE.PROPRIETAIRE.NOM+"' and IDENTIFIANT/DE='"+currentYear+"'][substring-before(IDENTIFIANT/OBJECTIF,'.')='"+currImmeuble.IDENTIFIANT.OBJECTIF+"']";				
						// Perform PRESTATION query work
						var currPrestation = _.find(prestationElfins, function(prestaElfin){ 
							// TODO: Adapt for "Migration Identifiant Unique Immeubles"
							return ( 
									prestaElfin.PARTENAIRE.PROPRIETAIRE.NOM === currImmeuble.PARTENAIRE.PROPRIETAIRE.NOM && 
									prestaElfin.IDENTIFIANT.OBJECTIF.substr(0, prestaElfin.IDENTIFIANT.OBJECTIF.indexOf('.')) === 
										currImmeuble.IDENTIFIANT.OBJECTIF ) });
						
						if (angular.isDefined(currPrestation)) {
							currImmeuble.GROUPE_COMPTABLE = currPrestation.IDENTIFIANT.ORIGINE;
						}
						augmentedImmeubles.push(currImmeuble);
					}		        	
					$log.debug(">>>> getAugmentedImmeubles - augmentedImmeubles.length = " + augmentedImmeubles.length);
					// Return list of augmented immeubles as a promise
					deferred.resolve(augmentedImmeubles);
	        	}, function(response) {
		            var message = "Le chargement des prestations a échoué (statut de retour: " + response.status + ")";
					// Return error message as a promise
		            deferred.reject(message);
		        });	
	        	
	        }, function(response) {
	            var message = "Le chargement des immeubles a échoué (statut de retour: " + response.status + ")";
				// Return error message as a promise
	            deferred.reject(message);
	        });			
			
		    return deferred.promise;
		};			

		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.INSTALLATION_SPORTIVE_ID` identifies collection containing ELFIN objects of CLASSE INSTALLATION_SPORTIVE.  
		 *  @see getList  
		 */
		var getInstallationsSportives = function(xpath) {
	        return getList(HB_COLLECTIONS.INSTALLATION_SPORTIVE_ID,xpath);
		};			
		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *   
		 * `HB_COLLECTIONS.INTRODUCTION_ELECTRICITE_ID` identifies collection containing ELFIN objects of CLASSE INTRODUCTION_ELECTRICITE.  
		 *  @see getList  
		 */
		var getIntroductionElectriciteList = function(xpath) {
	        return getList(HB_COLLECTIONS.INTRODUCTION_ELECTRICITE_ID,xpath);
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
		 * `HB_COLLECTIONS.ROLE_ID` constant identifies collection containing ELFIN objects of CLASSE ROLE.
		 * 
		 * Beware that collection containing ROLE does also contain other CLASSE objects and therefore xpath expression 
		 * should at least specify //ELFIN[@CLASSE='ROLE'] restriction. 
		 *  @see getList
		 */		
		var getRoleList = function(xpath) {
			return getList(HB_COLLECTIONS.ROLE_ID,xpath);
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
		 * `HB_COLLECTIONS.USER_ID` constant identifies collection containing ELFIN objects of CLASSE USER.
		 * 
		 * Beware that collection containing USER does also contain other CLASSE objects and therefore xpath expression 
		 * should at least specify //ELFIN[@CLASSE='USER'] restriction. 
		 *  @see getList
		 */		
		var getUserList = function(xpath) {
			return getList(HB_COLLECTIONS.USER_ID,xpath);
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
		
		
		
		/**
		 * `xpath`: Optional XPath restriction parameter, can be an empty string "".
		 *  
		 * `HB_COLLECTIONS.WC_ID` constant identifies collection containing ELFIN objects of CLASSE WC.
		 *  @see getList
		 */		
		var getWcList = function(xpath) {
			return getList(HB_COLLECTIONS.WC_ID,xpath);
		};	
	
		/**
		 * Get PRESTATION distinct accounting groups for the current year
		 */
		var getJsonAccountingGroups = function() {
			return GeoxmlService.getXqueryResult("jsonPrestationAccountingGroups.xq").get();
		};
		
		/**
		 * Get the number of contracts for a given SAI number and year. 
		 * The orderId parameter is necessary to exclude the `contract` 
		 * order from count if already persisted to database.
		 */
		var getJsonNbOfContracts = function(saiNb, year, orderId) {
			return GeoxmlService.getXqueryResult("jsonNextContractNbForSaiNb.xq").get({"saiNb" : saiNb, "year" : year , "orderId" : orderId});
		};			
		
		
		
        return {
        	getAbribusList:getAbribusList,
        	getActors:getActors,
        	getAmenagementSportifs:getAmenagementSportifs,
        	getCiterneList:getCiterneList,
        	getCodes:getCodes,
        	getCommandes:getCommandes,
        	getCommandesForSource:getCommandesForSource,
        	getConstats:getConstats,
        	getContrats:getContrats,
        	getEquipementList:getEquipementList,
        	getEquipementsSportifs:getEquipementsSportifs,
        	getFontaines:getFontaines,
        	getHorlogeList:getHorlogeList,
        	getImmeubles:getImmeubles,
        	getAugmentedImmeubles:getAugmentedImmeubles,
        	getInstallationsSportives:getInstallationsSportives,
        	getIntroductionElectriciteList:getIntroductionElectriciteList,
        	getLocationUnits:getLocationUnits,
        	getPrestations:getPrestations,
        	getProductionChaleurList:getProductionChaleurList,
        	getProductionFroidList:getProductionFroidList,
        	getRoleList:getRoleList,
        	getTransactions:getTransactions,
        	getUserList:getUserList,
        	getVentilationList:getVentilationList,
        	getWcList:getWcList,
        	getJsonAccountingGroups:getJsonAccountingGroups,
        	getJsonNbOfContracts:getJsonNbOfContracts
        };

    }]);
	
})();
