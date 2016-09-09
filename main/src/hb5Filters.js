/**
 * hb5 module custom filters.
 * 
 * Available ELFIN@CLASSE related filters:
 * 
 * <ul>
 * <li>actorListFilter</li>
 * <li>actorListAnyFilter</li>
 * <li>amenagementSportifListFilter</li>
 * <li>amenagementSportifListAnyFilter</li>
 * <li>annexExcludeTag</li>
 * <li>annexIncludeTag</li> 
 * <li>codeListFilter</li>
 * <li>commandeListFilter</li>
 * <li>commandeListAnyFilter</li>
 * <li>codeListAnyFilter</li>
 * <li>constatListFilter</li> 
 * <li>contractPerCompanyGroupListFilter</li>
 * <li>contractTerminatedListFilter</li>
 * <li>fontaineListFilter</li>
 * <li>fontaineListAnyFilter</li>
 * <li>fractionElfinRefFilter</li>
 * <li>horlogeListFilter</li>
 * <li>horlogeListAnyFilter</li>
 * <li>immeubleListFilter</li>
 * <li>immeubleListAnyFilter</li>  
 * <li>prestationListFilter</li>
 * <li>uniteLocativeListFilter</li>
 * <li>uniteLocativeListAnyFilter</li>
 * <li>wcListFilter</li>
 * <li>wcListAnyFilter</li>
 * </ul>
 * 
 * Available generic filters:
 * 
 * <ul> 
 * <li>notLast</li>
 * <li>plural</li>
 * </ul> 
 *  
 * @author Patrick Refondini 
 */
(function() {

	
	// ================================================================
	// ====            Filters utility functions                   ====
	// ================================================================
	
	/** 
	 * case insensitive string contains check
	 */
	var icontains = function (targetString, matchString) {
		
		// Support textual search for number type
		if (typeof targetString === "number" && targetString !== NaN && targetString !== undefined && targetString !== null) {
			targetString = targetString.toString();
		}
		
		if (matchString && matchString.trim().length > 0) {
			if (targetString) {
				if (targetString.toLowerCase().indexOf(matchString.toLowerCase()) != -1) {
					return true;
				} else {
					return false;
				}					
			} else { // If a match string is defined and there is no target string we consider it a non match.
				return false;
			}
		} else {
			// returns true if match string empty or undefined.
			return true;
		}

	};
	
	/**
	 * Checks what elfins match tokenised searchtext tokens using `checkfun`
	 * function as match condition, using AND logic between tokens outcomes.
	 * 
	 * Takes a collection of elfins, a `searchtext`, and a function `checkfun` 
	 * with (elfins,searchstring) and return type boolean signature. 
	 * The `searchstring` is being extracted from `searchtext` by tokenising 
	 * it with a given TOKENS_SEPARATOR. 
	 */
	var checkAndForTokenisedSearchText = function(elfins,searchtext, checkfun) {
		var TOKENS_SEPARATOR = " ";
		if (searchtext && searchtext.trim().length > 0 && searchtext.indexOf(TOKENS_SEPARATOR) != -1) {
			var searchtextTokens = searchtext.split(TOKENS_SEPARATOR);
			var booleanResult = true;
			for (var i = 0; i < searchtextTokens.length; i++) { 
				var currToken = searchtextTokens[i];
				// Avoid setting true result for something or nothing.
				if (currToken && currToken.trim().length > 0) {
					booleanResult = booleanResult && checkfun(elfins,currToken);
				}
			}
			return booleanResult;
		} else {
			return checkfun(elfins,searchtext);
		}	
	};	

	
	
	// ================================================================
	// ====                       Filters                          ====
	// ================================================================	
	
	/**
	 * Filter tailored to ACTEUR list requirements on strict list of fields defined as: 
	 * `predicate {qualite, nom, alias, groupe}`
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual actor list. 
	 */
	angular.module('hb5').filter('actorListFilter', [function () {
		
		return function (actors, predicate) {
	        if (!angular.isUndefined(actors) && actors !== null && !angular.isUndefined(predicate)) {
				console.log(">>>> actors.length, predicate = " + actors.length +", " + angular.toJson(predicate));	        	
	            var tempactors = [ ];
	            angular.forEach(actors, function (actor) {
                    if ( 
                    	 icontains(actor.IDENTIFIANT.QUALITE, predicate.qualite) &&
                    	 icontains(actor.IDENTIFIANT.NOM, predicate.nom) &&
                    	 icontains(actor.IDENTIFIANT.ALIAS, predicate.alias) &&
                    	 icontains(actor.GROUPE, predicate.groupe)
                    ) {
                    	tempactors.push(actor);
                    }
                });
	            return tempactors;
	        } else {
	            return actors;
	        }
	    };	    
	    
	    
	}]);	
	
	
	/**
	 * Filter tailored to ACTEUR list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual actor list. 
	 */
	angular.module('hb5').filter('actorListAnyFilter', [function () {
		
		return function (actors, searchText) {
	        if (!angular.isUndefined(actors) && actors !== null && !angular.isUndefined(searchText)) {
				console.log(">>>> actors.length, searchText = " + actors.length +", " + searchText);	        	
	            var tempactors = [ ];
	            angular.forEach(actors, function (actor) {
                    if ( 
                    	 icontains(actor.IDENTIFIANT.QUALITE, searchText) ||
                    	 icontains(actor.IDENTIFIANT.NOM, searchText) ||
                    	 icontains(actor.IDENTIFIANT.ALIAS, searchText) ||
                    	 icontains(actor.GROUPE, searchText)
                    ) {
                    	tempactors.push(actor);
                    }
                });
	            return tempactors;
	        } else {
	            return actors;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter tailored to AMENAGEMENT_SPORTIF list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual amenagementSportif list. 
	 */
	angular.module('hb5').filter('amenagementSportifListFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (amenagementSportifs, predicate) {
	        if (!angular.isUndefined(amenagementSportifs) && !angular.isUndefined(predicate)) {
	            var tempAmenagementSportifs = [ ];
	            angular.forEach(amenagementSportifs, function (amenagementSportif) {
	            	var amenagementSportifPlace = hbUtil.getCARByPos(amenagementSportif, 1);
	            	amenagementSportifPlace = (amenagementSportifPlace === undefined) ? {"VALEUR" : ""} : amenagementSportifPlace;
                    if ( 
                    	 icontains(amenagementSportif.PARTENAIRE.PROPRIETAIRE.NOM, predicate.owner) &&
                    	 icontains(amenagementSportif.IDENTIFIANT.OBJECTIF, predicate.registerNb) &&
                    	 //icontains(immeuble.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, predicate.place) &&
                    	 icontains(amenagementSportifPlace.VALEUR, predicate.place) &&
                    	 icontains(amenagementSportif.GROUPE, predicate.group) &&
                    	 icontains(amenagementSportif.IDENTIFIANT.NOM, predicate.buildingNb) &&
                    	 icontains(amenagementSportif.IDENTIFIANT.ALIAS, predicate.address)
                    ) {
                    	tempAmenagementSportifs.push(amenagementSportif);
                    }
                });
	            return tempAmenagementSportifs;
	        } else {
	            return amenagementSportifs;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter tailored to AMENAGEMENT_SPORTIF list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual amenagementSportif list. 
	 */
	angular.module('hb5').filter('amenagementSportifListAnyFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (amenagementSportifs, searchtext) {

			var checkAnyField = function(amenagementSportif,searchtext) {
				var amenagementSportifPlace = hbUtil.getCARByPos(amenagementSportif, 1);
				amenagementSportifPlace = (amenagementSportifPlace === undefined) ? {"VALEUR" : ""} : amenagementSportifPlace;
				return (
					icontains(amenagementSportif.GROUPE, searchtext) ||
					icontains(amenagementSportif.PARTENAIRE.PROPRIETAIRE.NOM, searchtext) ||
					icontains(amenagementSportif.IDENTIFIANT.OBJECTIF, searchtext) ||
					//icontains(amenagementSportif.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, searchtext) ||
					icontains(amenagementSportifPlace.VALEUR, searchtext) ||
//					icontains(amenagementSportif.IDENTIFIANT.NOM, searchtext) ||
					icontains(amenagementSportif.IDENTIFIANT.ALIAS, searchtext)
				);		
			};			

	        if (!angular.isUndefined(amenagementSportifs) && !angular.isUndefined(searchtext)) {
	            var tempAmenagementSportifs = [ ];
	            angular.forEach(amenagementSportifs, function (amenagementSportif) {
                    if ( checkAndForTokenisedSearchText(amenagementSportif,searchtext,checkAnyField) ) {
                    	tempAmenagementSportifs.push(amenagementSportif);
                    }
                });
	            return tempAmenagementSportifs;
	        } else {
	            return amenagementSportifs;
	        }
	    };
	}]);	


	/**
	 * Filter specialised for ELFIN ANNEXE RENVOI.
	 *  
	 * `tag` parameter is expected to be a plain text string which 
	 * will be used for filtering in a case insensitive way, excluding
	 * matching tags.
	 * 
	 * Usage: annexExcludeTagFilter:tag 
	 * For instance: annexExcludeTagFilter:photo
	 */
	angular.module('hb5').filter('annexExcludeTag', [function () {

		return function (RENVOIS, tag) {
	        if (!angular.isUndefined(RENVOIS) && !angular.isUndefined(tag)) {
	        	var tagLower = tag.toLowerCase();
	            var fileteredRENVOIS = [];
	            for (var i = 0; i < RENVOIS.length; i++) {
					var RENVOI = RENVOIS[i];
					if ( RENVOI.VALUE.toLowerCase().indexOf(tagLower) == -1 ) {
						fileteredRENVOIS.push(RENVOI);
					}
				}
	            return fileteredRENVOIS;
	        } else {
	            return RENVOIS;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter specialised for ELFIN ANNEXE RENVOI.
	 *  
	 * `tag` parameter is expected to be a plain text string which 
	 * will be used for filtering in a case insensitive way, including
	 * matching tags.
	 * 
	 * Usage: annexIncludeTag:tag 
	 * For instance: annexIncludeTag:photo
	 */
	angular.module('hb5').filter('annexIncludeTag', [function () {
		
		return function (RENVOIS, tag) {
	        if (!angular.isUndefined(RENVOIS) && !angular.isUndefined(tag)) {
	        	var tagLower = tag.toLowerCase();
	            var fileteredRENVOIS = [];
	            for (var i = 0; i < RENVOIS.length; i++) {
					var RENVOI = RENVOIS[i];
					if ( RENVOI.VALUE.toLowerCase().indexOf(tagLower) != -1 ) {
						fileteredRENVOIS.push(RENVOI);
					}
				}
	            return fileteredRENVOIS;
	        } else {
	            return RENVOIS;
	        }
	    };
	}]);		
	
	
	/**
	 * Filter tailored to CODE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual code list. 
	 */
	angular.module('hb5').filter('codeListFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (codes, predicate) {
	        if (!angular.isUndefined(codes) && !angular.isUndefined(predicate)) {
	            var tempCodes = [ ];
	            angular.forEach(codes, function (code) {
	            	// var codeSortPosition = hbUtil.getCARByPos(code, 1);
                    if ( 
                    	 icontains(code.IDENTIFIANT.NOM, predicate.codeNb) &&
                    	 icontains(code.DIVERS.REMARQUE, predicate.codeDescription) && 
                    	 icontains(code.GROUPE, predicate.codeGroup)
                    ) {
                    	tempCodes.push(code);
                    }
                });
	            return tempCodes;
	        } else {
	            return codes;
	        }
	    };
	}]);
	
	
	/**
	 * Filter tailored to CODE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual code list. 
	 */
	angular.module('hb5').filter('codeListAnyFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (codes, searchtext) {
			
			var checkAnyField = function(code,searchtext) {
				return (
					icontains(code.IDENTIFIANT.NOM, searchtext) ||
					icontains(code.DIVERS.REMARQUE, searchtext)   
				);		
			};
			
	        if (!angular.isUndefined(codes) && !angular.isUndefined(searchtext)) {
	            var tempCodes = [ ];
	            angular.forEach(codes, function (code) {
                    if ( checkAndForTokenisedSearchText(code,searchtext,checkAnyField) ) {
                    	tempCodes.push(code);	
                    }
                });
	            return tempCodes;
	        } else {
	            return codes;
	        }
	    };
	    
	}]);	
	

	/**
	 * Filter tailored to COMMANDE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual code list.
	 */
	angular.module('hb5').filter('commandeListFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (commandes, predicate) {
	        if (!angular.isUndefined(commandes) && !angular.isUndefined(predicate)) {
	            var tempCommandes = [ ];
	            angular.forEach(commandes, function (commande) {
                    if ( 
                       	 icontains(commande.IDENTIFIANT.NOM, predicate.orderNb) &&
                    	 icontains(commande.IDENTIFIANT.OBJECTIF, predicate.registerNb) && 
                    	 icontains(commande.IDENTIFIANT.ORIGINE, predicate.buildingNb) &&
                    	 icontains(commande.GROUPE, predicate.cfc) &&
                    	 icontains(commande.IDENTIFIANT.QUALITE, predicate.orderType) &&
                    	 icontains(commande.IDENTIFIANT.DE, predicate.date) &&
                    	 icontains(commande.IDENTIFIANT.VALEUR, predicate.amount) &&
                    	 icontains(commande.PARTENAIRE.FOURNISSEUR.GROUPE, predicate.provider_group) &&
                    	 icontains(commande.PARTENAIRE.PROPRIETAIRE.GROUPE, predicate.owner_group) &&
                    	 icontains(commande.DIVERS.REMARQUE, predicate.description)
                    ) {
                    	tempCommandes.push(commande);
                    }
                });
	            return tempCommandes;
	        } else {
	            return commandes;
	        }
	    };
	}]);
	
	
	/**
	 * Filter tailored to COMMANDE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual code list. 
	 */
	angular.module('hb5').filter('commandeListAnyFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (commandes, searchtext) {
			
			var checkAnyField = function(commande,searchtext) {
				return (
					icontains(commande.IDENTIFIANT.NOM, searchtext) ||
					icontains(commande.IDENTIFIANT.OBJECTIF, searchtext) ||
					icontains(commande.IDENTIFIANT.ORIGINE, searchtext) ||
					icontains(commande.GROUPE, searchtext) ||
					icontains(commande.IDENTIFIANT.QUALITE, searchtext) ||
					icontains(commande.IDENTIFIANT.DE, searchtext) ||
					icontains(commande.IDENTIFIANT.VALEUR, searchtext) ||
					icontains(commande.PARTENAIRE.FOURNISSEUR.GROUPE, searchtext) ||
					icontains(commande.PARTENAIRE.PROPRIETAIRE.GROUPE, searchtext) ||
					icontains(commande.DIVERS.REMARQUE, searchtext)   
				);		
			};
			
	        if (!angular.isUndefined(commandes) && !angular.isUndefined(searchtext)) {
	            var tempCommandes = [ ];
	            angular.forEach(commandes, function (commande) {
                    if ( checkAndForTokenisedSearchText(commande,searchtext,checkAnyField) ) {
                    	tempCommandes.push(commande);	
                    }
                });
	            return tempCommandes;
	        } else {
	            return commandes;
	        }
	    };
	    
	}]);	
	
	
	
// ======
	

	/**
     * Filter tailored to CONSTAT list requirements
     * Keeping 'Filter' postfix is useful to avoid naming conflict with actual constat list.
	 */
	angular.module('hb5').filter('constatListFilter', [function () {
	
		return function (constats, predicate) {
	        if (!angular.isUndefined(constats) && !angular.isUndefined(predicate)) {
	            var tempConstats = [ ];
	            angular.forEach(constats, function (constat) {
	            	var currentlastResp = undefined; 
	            	if (!angular.isUndefined(constat.ACTIVITE.EVENEMENT.ECHEANCE) && constat.ACTIVITE.EVENEMENT.ECHEANCE.length > 0) {
	            		currentlastResp = constat.ACTIVITE.EVENEMENT.ECHEANCE[constat.ACTIVITE.EVENEMENT.ECHEANCE.length-1].POUR_QUI;
	            	}
	            	var currentPartnerUser = undefined;
	            	if (!angular.isUndefined(constat.PARTENAIRE) && !angular.isUndefined(constat.PARTENAIRE.USAGER) && !angular.isUndefined(constat.PARTENAIRE.USAGER.VALUE)) {
	            		currentPartnerUser = constat.PARTENAIRE.USAGER.VALUE;
	            	}
                    if ( 
                    	 icontains(currentlastResp, predicate.last_resp) &&
                    	 icontains(constat.IDENTIFIANT.DE, predicate.constat_date) &&
                    	 icontains(constat.IDENTIFIANT.NOM, predicate.description) &&                    	 
                    	 icontains(currentPartnerUser, predicate.partenaire_usager) && 
                    	 icontains(constat.GROUPE, predicate.constat_group) &&
                    	 icontains(constat.IDENTIFIANT.OBJECTIF, predicate.constat_noSAI)
                    ) {
                    	tempConstats.push(constat);
                    	
                    }
                });
	            return tempConstats;
	        } else {
	            return constats;
	        }
	    };
	}]);
	
	
	/**
     * Filter CONTRAT per company group (ELFIN.GROUPE / ELFIN@GROUPE)
     * 
	 */
	angular.module('hb5').filter('contractPerCompanyGroupListFilter', ['$log','hbUtil', function ($log,hbUtil) {
	
		return function (contracts, companyGroup) {

	        if (!angular.isUndefined(contracts)) {

	            // Temp array to store results to
		    	var tempcontracts = [ ];
	            
	            angular.forEach(contracts, function (contract) {

	            	if (
	            			angular.isDefined(contract.PARTENAIRE) && 
	            			angular.isDefined(contract.PARTENAIRE.FOURNISSEUR) && 
	            			angular.isDefined(contract.PARTENAIRE.FOURNISSEUR.VALUE) && 
	            			!(contract.PARTENAIRE.FOURNISSEUR.VALUE === null) &&  
	            			contract.PARTENAIRE.FOURNISSEUR.VALUE === companyGroup) {
	            		tempcontracts.push(contract);
	            	}
  		    		
                });
	            return tempcontracts;
	        } else {
	            return contracts;
	        }
	    };
	}]);	
	
	
	/**
     * Filter tailored to CONTRAT list requirements
     * 
	 */
	angular.module('hb5').filter('contractTerminatedListFilter', ['$log','hbUtil', function ($log,hbUtil) {
	
		return function (contracts, isTerminated) {

			// Manage optional isTerminated parameter with default behaviour to isTerminated = true
			var testTerminated = undefined;
			if (angular.isDefined(isTerminated) && _.isBoolean(isTerminated)) {
				testTerminated = isTerminated;
			} else {
				testTerminated = true;
			}


	        if (!angular.isUndefined(contracts)) {
		    	// Define current date to compare from
		    	var currentDate = moment();
	            // Temp array to store results to
		    	var tempcontracts = [ ];
	            
	            angular.forEach(contracts, function (contract) {

	            	if (angular.isDefined(contract.IDENTIFIANT.A) && !(contract.IDENTIFIANT.A == null) ) {
	 			   		// Get moment date from text date 
	 		    		var trimmedDate = contract.IDENTIFIANT.A.trim();
	 		    		// Check text date valid
	 		    		if (hbUtil.isValidDateFromHbTextDateFormat(trimmedDate)) {
	 		    			// Convert text to moment date
	 	 		    		var checkedDate = hbUtil.getMomentDateFromHbTextDateFormat(trimmedDate);
	 	 		    		// Compute number of days difference between checkedDate and current date.
	 	 		    		var daysDiff = checkedDate.diff(currentDate, 'days');
	 	 		    		// Negative difference means date in the past thus terminated contract
	 	 		    		if (daysDiff < 0 && testTerminated) {
	 	 		    			tempcontracts.push(contract);
	 	 		    		} else if (daysDiff >= 0 && !testTerminated) { // Use case for anticipated termination not yet effective 
	 	 		    			tempcontracts.push(contract);
	 	 		    		}
	 		    		} else {
		            		// Non-terminated contracts may have no date defined and are thus expected to fail 
	 		    			// hbUtil.isValidDateFromHbTextDateFormat test and be part of the result list.
	 		    			// Intended side effect is that contracts with other type of invalid date are also 
	 		    			// kept visible in the list of non terminated contracts for end user to review.
		            		if (!testTerminated) {
		            			tempcontracts.push(contract);
		            		}
	 		    		}
	            	} else {
	            		// Non terminated contracts may not have any A field defined.
	            		if (!testTerminated) {
	            			tempcontracts.push(contract);
	            		}
	            	}
  		    		
                });
	            return tempcontracts;
	        } else {
	            return contracts;
	        }
	    };
	}]);	


	/**
	 * Filter tailored to FONTAINE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual fontaine list. 
	 */
	angular.module('hb5').filter('fontaineListFilter', [function () {
		
		return function (fontaines, search) {
	        if (!angular.isUndefined(fontaines) && !angular.isUndefined(search)) {
	            var tempFontaines = [ ];
	            angular.forEach(fontaines, function (fontaine) {
                    if ( 
                    	 icontains(fontaine.IDENTIFIANT.OBJECTIF, search.objectif) &&
                    	 icontains(fontaine.IDENTIFIANT.NOM, search.nom) &&
                    	 icontains(fontaine.IDENTIFIANT.ALIAS, search.alias) &&
                    	 icontains(fontaine.DIVERS.REMARQUE, search.remark)
                    ) {
                    	tempFontaines.push(fontaine);
                    }
                });
	            return tempFontaines;
	        } else {
	            return fontaines;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter tailored to FONTAINE list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual fontaine list. 
	 */
	angular.module('hb5').filter('fontaineListAnyFilter', [function () {
		
		return function (fontaines, searchtext) {
			
			var checkFontaine = function(fontaine, searchtext) {
				return (
                   	 icontains(fontaine.IDENTIFIANT.OBJECTIF, searchtext) ||
                	 icontains(fontaine.IDENTIFIANT.NOM, searchtext) ||
                	 icontains(fontaine.IDENTIFIANT.ALIAS, searchtext) || 
                	 icontains(fontaine.DIVERS.REMARQUE, searchtext)
	    		);
			};					
			
	        if (!angular.isUndefined(fontaines) && !angular.isUndefined(searchtext)) {
	            var tempFontaines = [ ];
	            angular.forEach(fontaines, function (fontaine) {
                    if ( checkAndForTokenisedSearchText(fontaine,searchtext,checkFontaine) ) {
                    	tempFontaines.push(fontaine);
                    }
                });
	            return tempFontaines;
	        } else {
	            return fontaines;
	        }
	    };
	}]);
	

	/**
     * Filter tailored to ELFIN/CARACTERISTIQUE/FRACTION/L elements used to store ELFIN references as:
     * 
     * <L>
     *       <C POS="1">ELFIN@CLASSE</C>
     *       <C POS="2">ELFIN@ID_G</C>
     *       <C POS="3">ELFIN@Id</C>
     *       <C POS="4">ELFIN@GROUPE</C>
     *       <C POS="5">ELFIN/IDENTIFIANT/NOM</C>
     * </L>
     * 
     * Example usage: 
     * 
     * fractionElfinRefFilter:'IMMEUBLE'
     * Only L with <C POS="1">IMMEUBLE</C> will match
     * 
     * 
     * fractionElfinRefFilter:'IMMEUBLE':false
     * Only L with <C POS="1">IMMEUBLE</C> will match
     * 
     * 
     * fractionElfinRefFilter:'IMMEUBLE':true
     * L with <C POS="1">IMMEUBLE</C> or empty <C POS="1"></C> will match
     * 
     * 
     * fractionElfinRefFilter:''
     * L with empty <C POS="1"></C> will match
     * 
	 */
	angular.module('hb5').filter('fractionElfinRefFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (fractionLs, classe, includeEmptyClasse) {
	        if (!angular.isUndefined(fractionLs) && !angular.isUndefined(classe)) {
	            var tempFractionLs = [ ];
	            angular.forEach(fractionLs, function (fractionL) {
                    if ( hbUtil.getCByPos(fractionL.C, 1).VALUE === classe ) {
                    	tempFractionLs.push(fractionL);
                    } else if ( includeEmptyClasse && ( angular.isUndefined(hbUtil.getCByPos(fractionL.C, 1)) || hbUtil.getCByPos(fractionL.C, 1).VALUE === '' ) ) {
                    	tempFractionLs.push(fractionL);
                    }
                });
	            return tempFractionLs;
	        } else {
	            return fractionLs;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter tailored to HORLOGE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual horloge list. 
	 */
	angular.module('hb5').filter('horlogeListFilter', [function () {
		
		return function (horloges, search) {
	        if (!angular.isUndefined(horloges) && !angular.isUndefined(search)) {
	            var tempHorloges = [ ];
	            angular.forEach(horloges, function (horloge) {
                    if ( 
                    	 icontains(horloge.IDENTIFIANT.NOM, search.nom) &&
                    	 icontains(horloge.IDENTIFIANT.ALIAS, search.alias) &&
                    	 icontains(horloge.DIVERS.REMARQUE, search.remark)
                    ) {
                    	tempHorloges.push(horloge);
                    }
                });
	            return tempHorloges;
	        } else {
	            return horloges;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter tailored to HORLOGE list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual horloge list. 
	 */
	angular.module('hb5').filter('horlogeListAnyFilter', [function () {
		
		return function (horloges, searchtext) {
			
			var checkHorloge = function(horloge, searchtext) {
				return (
                	 icontains(horloge.IDENTIFIANT.NOM, searchtext) ||
                	 icontains(horloge.IDENTIFIANT.ALIAS, searchtext) || 
                	 icontains(horloge.DIVERS.REMARQUE, searchtext)
	    		);
			};					
			
	        if (!angular.isUndefined(horloges) && !angular.isUndefined(searchtext)) {
	            var tempHorloges = [ ];
	            angular.forEach(horloges, function (horloge) {
                    if ( checkAndForTokenisedSearchText(horloge,searchtext,checkHorloge) ) {
                    	tempHorloges.push(horloge);
                    }
                });
	            return tempHorloges;
	        } else {
	            return horloges;
	        }
	    };
	}]);	
	
	
	/** 
	 * Encapsulate test to find out if a given IMMEUBLE is retired or not.
	 */
	var immeubleIsActive = function (immeuble) {
		if (immeuble.IDENTIFIANT.A && immeuble.IDENTIFIANT.A.trim().length > 0) { 
			return false 
		} else {
			return true
		}
	};	
	
	
	/**
	 * Filter tailored to IMMEUBLE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual immeuble list. 
	 */
	angular.module('hb5').filter('immeubleListFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (immeubles, predicate) {
	        if (!angular.isUndefined(immeubles) && !angular.isUndefined(predicate)) {
	            var tempImmeubles = [ ];
	            angular.forEach(immeubles, function (immeuble) {
	            	var immeublePlace = hbUtil.getCARByPos(immeuble, 1);
	            	immeublePlace = (immeublePlace === undefined) ? {"VALEUR" : ""} : immeublePlace;
                    if ( 
                    	 icontains(immeuble.PARTENAIRE.PROPRIETAIRE.NOM, predicate.owner) &&
                    	 icontains(immeuble.IDENTIFIANT.OBJECTIF, predicate.registerNb) &&
                    	 //icontains(immeuble.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, predicate.place) &&
                    	 icontains(immeublePlace.VALEUR, predicate.place) &&
                    	 icontains(immeuble.IDENTIFIANT.NOM, predicate.buildingNb) &&
                    	 icontains(immeuble.IDENTIFIANT.ALIAS, predicate.address) &&
                    	 icontains(immeuble.IDENTIFIANT.GER, predicate.GER) &&
                    	 icontains(immeuble.GROUPE_COMPTABLE, predicate.GROUPE_COMPTABLE) && 
                    	 ( 
                    			 predicate.active === "yes" && immeubleIsActive(immeuble) || 
                    			 predicate.active === "no" && !immeubleIsActive(immeuble) || 
                    			 predicate.active === "any")  
                    ) {
                    	tempImmeubles.push(immeuble);
                    }
                });
	            return tempImmeubles;
	        } else {
	            return immeubles;
	        }
	    };
	}]);
	
	
	/**
	 * Filter tailored to IMMEUBLE list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual immeuble list. 
	 */
	angular.module('hb5').filter('immeubleListAnyFilter', ['$log','hbUtil', function ($log,hbUtil) {
		
		return function (immeubles, searchtext, active) {

			var checkAnyField = function(immeuble,searchtext) {
				var immeublePlace = hbUtil.getCARByPos(immeuble, 1);
				immeublePlace = (immeublePlace === undefined) ? {"VALEUR" : ""} : immeublePlace;
				return (
					icontains(immeuble.PARTENAIRE.PROPRIETAIRE.NOM, searchtext) ||
					icontains(immeuble.IDENTIFIANT.OBJECTIF, searchtext) ||
					//icontains(immeuble.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, searchtext) ||
					icontains(immeublePlace.VALEUR, searchtext) ||
//					icontains(immeuble.IDENTIFIANT.NOM, searchtext) ||
					icontains(immeuble.IDENTIFIANT.ALIAS, searchtext) ||
					icontains(immeuble.GROUPE_COMPTABLE, searchtext)
				);		
			};			

	        if (!angular.isUndefined(immeubles) && !angular.isUndefined(searchtext)) {
	            var tempImmeubles = [ ];
	            angular.forEach(immeubles, function (immeuble) {
	            	
                    if ( checkAndForTokenisedSearchText(immeuble,searchtext,checkAnyField) ) {
                    	if ( !angular.isUndefined(active) && ( active === 'any' || active === 'yes' || active === 'no' ) ) {
                    		if ( active === "any" || 
                    			   active === "yes" && immeubleIsActive(immeuble) || 
                              	   active === "no" && !immeubleIsActive(immeuble) 
                              	) {
                    			tempImmeubles.push(immeuble);
                    		}
                    	} else { 
                    		tempImmeubles.push(immeuble);	
                    	}                    	
                    }
                });
	            return tempImmeubles;
	        } else {
	            return immeubles;
	        }
	    };
	}]);
	
	
	/**
	 * Filter tailored to PRESTATION list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual prestation list. 
	 */
	angular.module('hb5').filter('prestationListFilter', [function () {
		
		return function (prestations, search) {
			
			/**
			 * checkManager function adds behaviour: 
			 * `If a Manager criterion is defined and no Manager is defined in prestation then match result is false`
			 * to icontains behaviour.
			 */
			var checkManager = function(prestation) {
				if (!angular.isUndefined(prestation.PARTENAIRE) && !angular.isUndefined(prestation.PARTENAIRE.GERANT)) {
					return icontains(prestation.PARTENAIRE.GERANT.VALUE,search.manager);
				} else {
					if (search.manager && search.manager.trim().length > 0) {
						return false;
					} else {
						return true;
					}
				}				
			};
			
			/**
			 * checkRemark function adds behaviour: 
			 * `If a Remark criterion is defined and no Remark is defined in prestation then match result is false`
			 * to icontains behaviour.
			 */
			var checkRemark = function(prestation) {
				   //(!angular.isUndefined(prestation.DIVERS) ? icontains(prestation.DIVERS.REMARQUE, search.remark) : true)
				if (!angular.isUndefined(prestation.DIVERS)) {
					return icontains(prestation.DIVERS.REMARQUE, search.remark);
				} else {
					if (search.remark && search.remark.trim().length > 0) {
						return false;
					} else {
						return true;
					}
				}				
			};
			
			/**
			 * Allow several dates criteria union using OR condition entered as pipe sign by advanced users.
			 * This is specific to IDENTIFIANT.DE property (From date).
			 */
			var checkFromForOr = function(prestation) {
				if (search.from && search.from.trim().length > 0 && search.from.indexOf("|") != -1) {
					var searchTokens = search.from.split("|");
					var booleanResult = false;
					for (var i = 0; i < searchTokens.length; i++) { 
						var currToken = searchTokens[i];
						// Avoid setting true result for something or nothing.
						if (currToken && currToken.trim().length > 0) {
							booleanResult = booleanResult || icontains(prestation.IDENTIFIANT.DE, currToken);
						}
					}
					return booleanResult;
				} else {
					return icontains(prestation.IDENTIFIANT.DE, search.from);
				}				
			};			
			
	        if (!(prestations == null || search == null ) && !angular.isUndefined(prestations) && !angular.isUndefined(search)) {
	        	//console.log(">>>> prestations.length, search = " + prestations.length +", " + search);
	            var tempPrestations = [ ];
	            angular.forEach(prestations, function (prestation) {
                    if ( 
                    	 icontains(prestation.GROUPE, search.group) &&
                    	 icontains(prestation.IDENTIFIANT.ORIGINE, search.origin) &&
                    	 icontains(prestation.IDENTIFIANT.COMPTE, search.account) &&
                    	 icontains(prestation.IDENTIFIANT.OBJECTIF, search.goal) &&
                    	 //icontains(prestation.IDENTIFIANT.DE, search.from) &&
                    	 checkFromForOr(prestation) &&
                    	 //TODO: Numeric is not supported yet. Should use > < = operators to be useful.
                    	 //icontains(prestation.IDENTIFIANT.VALEUR_A_NEUF, search.replacementValue) &&
                    	// If no PARTENAIRE.GERANT object is available deactivate search restriction by always returning true
                    	 checkManager(prestation) && 
                    	 //(!angular.isUndefined(prestation.PARTENAIRE) && !angular.isUndefined(prestation.PARTENAIRE.GERANT) ? icontains(prestation.PARTENAIRE.GERANT.VALUE, search.manager) : true) &&
                    	 //TODO: find the correct way to deal with references.
                    	 //icontains(prestation.PARTENAIRE.PROPRIETAIRE.Id, search.owner) &&
                    	 // If no DIVERS object is available deactivate search restriction by always returning true
                    	 checkRemark(prestation)
                    ) {
                    	tempPrestations.push(prestation);
                    }
                });
	            return tempPrestations;
	        } else {
	            return prestations;
	        }
	    };
	}]);
	
		
	/**
	 * Filter tailored to UNITE_LOCATIVE (SURFACE) list requirements.
	 * `buildingElfins` third parameter is only required if predicate.address is specified.
	 * Indeed the address information is contained in the UNITE_LOCATIVE parent entry IMMEUBLE.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual uniteLocative list. 
	 */
	angular.module('hb5').filter('uniteLocativeListFilter', ['$log', function ($log) {
		
		return function (uniteLocatives, predicate, buildingElfins) {
			
	        if (!angular.isUndefined(uniteLocatives) && !angular.isUndefined(predicate)) {
	        	
	            /**
	             * Find address for location unit
	             */
	            var getAddress = function (buildingElfins, locationUnitOrigine) {
	            	var matchingBuilding = _.find(buildingElfins, function(e){ return e.Id === locationUnitOrigine; } );
	            	if (matchingBuilding) {
	            		return matchingBuilding.IDENTIFIANT.ALIAS;
	            	} else {
	            		return "";	
	            	}
	            };	        	
	        	
	            var tempUniteLocatives = [ ];
	            angular.forEach(uniteLocatives, function (uniteLocative) {
	            	var currentOwner = undefined;
	            	var currentTenant = undefined;
	            	if ( !angular.isUndefined(uniteLocative.PARTENAIRE) 
            			  ) {
	            		if ( !angular.isUndefined(uniteLocative.PARTENAIRE.PROPRIETAIRE) ) {
	            			currentOwner = uniteLocative.PARTENAIRE.PROPRIETAIRE.VALUE;	            			
	            		}
	            		if ( !angular.isUndefined(uniteLocative.PARTENAIRE.USAGER) ) {
	            			currentTenant = uniteLocative.PARTENAIRE.USAGER.VALUE
	            		}	
	            	}
	            	// Address information is contained in IMMEUBLE parent of UNITE_LOCATIVE
	            	var currentBuildingAddress = undefined;
	            	if ( !angular.isUndefined(predicate.address) ) {
	            		currentBuildingAddress = getAddress(buildingElfins, uniteLocative.IDENTIFIANT.ORIGINE);
	            	}
                    if ( 
                    	 icontains(currentOwner, predicate.owner) &&
                    	 icontains(currentTenant, predicate.tenant) &&
                    	 icontains(uniteLocative.IDENTIFIANT.OBJECTIF, predicate.registerNb) && 
                    	 icontains(uniteLocative.IDENTIFIANT.GER, predicate.GER) &&
                    	 icontains(currentBuildingAddress, predicate.address)
                    ) {
                    	tempUniteLocatives.push(uniteLocative);
                    }
                });
	            return tempUniteLocatives;
	        } else {
	            return uniteLocatives;
	        }
	    };
	}]);	
	
	
	
	/**
	 * Filter tailored to UNITE_LOCATIVE list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual uniteLocative list. 
	 */
	angular.module('hb5').filter('uniteLocativeListAnyFilter', [function () {

		return function (uniteLocatives, searchtext, buildingElfins) {
			
            /**
             * Find address for location unit
             */
            var getAddress = function (buildingElfins, locationUnitOrigine) {
            	var matchingBuilding = _.find(buildingElfins, function(e){ return e.Id === locationUnitOrigine; } );
            	if (matchingBuilding) {
            		return matchingBuilding.IDENTIFIANT.ALIAS;
            	} else {
            		return "";	
            	}
            };	
			

			var checkUniteLocative = function(uniteLocative, searchtext) {
				return (
						(
	    				!angular.isUndefined(uniteLocative.PARTENAIRE) && 
	    				!angular.isUndefined(uniteLocative.PARTENAIRE.PROPRIETAIRE) && 
	    				icontains(uniteLocative.PARTENAIRE.PROPRIETAIRE.VALUE, searchtext)
						) || 
						(
			    		!angular.isUndefined(uniteLocative.PARTENAIRE) && 
			    		!angular.isUndefined(uniteLocative.PARTENAIRE.USAGER) && 
			    		icontains(uniteLocative.PARTENAIRE.USAGER.VALUE, searchtext)
						) 						
						|| icontains(uniteLocative.IDENTIFIANT.OBJECTIF, searchtext)
						|| icontains(uniteLocative.WRAPPED_ADDRESS, searchtext)
	    		);
			};			
			
	        if (!angular.isUndefined(uniteLocatives) && !angular.isUndefined(searchtext)) {
	            var tempUniteLocatives = [ ];
	            angular.forEach(uniteLocatives, function (uniteLocative) {
	            	
	            	// Address information is contained in IMMEUBLE parent of UNITE_LOCATIVE
	            	var currentBuildingAddress = getAddress(buildingElfins, uniteLocative.IDENTIFIANT.ORIGINE);

	            	// Augment UNITE_LOCATIVE with IMMEUBLE address
	            	uniteLocative.WRAPPED_ADDRESS = currentBuildingAddress;
	            	
                    if ( checkAndForTokenisedSearchText(uniteLocative,searchtext,checkUniteLocative) ) {
                    	tempUniteLocatives.push(uniteLocative);
                    }
                });
	            return tempUniteLocatives;
	        } else {
	            return uniteLocatives;
	        }
	    };
	}]);	

		
	/**
	 * Filter tailored to WC list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual wc list. 
	 */
	angular.module('hb5').filter('wcListFilter', [function () {
		
		return function (wcs, search) {
	        if (!angular.isUndefined(wcs) && !angular.isUndefined(search)) {
	            var tempWcs = [ ];
	            angular.forEach(wcs, function (wc) {
                    if ( 
                    	 icontains(wc.IDENTIFIANT.NOM, search.nom) &&
                    	 icontains(wc.IDENTIFIANT.ALIAS, search.alias) &&
                    	 icontains(wc.DIVERS.REMARQUE, search.remark)
                    ) {
                    	tempWcs.push(wc);
                    }
                });
	            return tempWcs;
	        } else {
	            return wcs;
	        }
	    };
	}]);	
	
	
	/**
	 * Filter tailored to WC list single search criterion on `all fields`.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual wc list. 
	 */
	angular.module('hb5').filter('wcListAnyFilter', [function () {
		
		return function (wcs, searchtext) {
			
			var checkWc = function(wc, searchtext) {
				return (
                	 icontains(wc.IDENTIFIANT.NOM, searchtext) ||
                	 icontains(wc.IDENTIFIANT.ALIAS, searchtext) || 
                	 icontains(wc.DIVERS.REMARQUE, searchtext)
	    		);
			};					
			
	        if (!angular.isUndefined(wcs) && !angular.isUndefined(searchtext)) {
	            var tempWcs = [ ];
	            angular.forEach(wcs, function (wc) {
                    if ( checkAndForTokenisedSearchText(wc,searchtext,checkWc) ) {
                    	tempWcs.push(wc);
                    }
                });
	            return tempWcs;
	        } else {
	            return wcs;
	        }
	    };
	}]);	
	
	
	
	
	
	/**
	 * Filter returning all array elements except last one
	 */
	angular.module('hb5').filter('notLast', [function () {

		return function (elements) {
	        if (!angular.isUndefined(elements)) {
	            var tempElements = [];
	            for (var i = 0; i < elements.length-1; i++) {
					var element = elements[i];
					tempElements.push(element);
				}
	            return tempElements;
	        } else {
	            return elements;
	        }
	    };
	}]);
	
	
    /**
     * Basic filter to add an "s" to result titles 
     * depending on the number of entries returned. 
     */
	angular.module('hb5').filter('plural', function() {
		return function(number) {
			if (number > 1) {
				return "s";
			} else {
				return "";
			}
		};
	});
	

	
})();
