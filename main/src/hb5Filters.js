/**
 * hb5 module custom filters.
 * 
 * Available filters:
 * <ul>
 * <li>annexExcludeTag</li>
 * <li>annexIncludeTag</li>
 * <li>constatListFilter</li>
 * <li>immeubleListFilter</li> 
 * <li>notLast</li>
 * <li>plural</li>
 * </ul> 
 *  
 * @author Patrick Refondini 
 */
(function() {

	/** 
	 * case insensitive string contains check
	 */
	var icontains = function (targetString, matchString) {
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

	/**
	 * Filter specialised for ELFIN ANNEXE RENVOI.
	 *  
	 * `tag` parameter is expected to be a plain text string which 
	 * will be used for filtering in a case insensitive way, excluding
	 * matching tags.
	 * 
	 * Usage: annexExcludeTabFilter:tag 
	 * For instance: annexExcludeTabFilter:photo
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
                    	 icontains(constat.IDENTIFIANT.DE, predicate.description) &&
                    	 icontains(constat.IDENTIFIANT.NOM, predicate.constat_date) &&
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
	 * Filter tailored to IMMEUBLE list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual immeuble list. 
	 */
	angular.module('hb5').filter('immeubleListFilter', [function () {
		
		return function (immeubles, predicate) {
	        if (!angular.isUndefined(immeubles) && !angular.isUndefined(predicate)) {
	            var tempImmeubles = [ ];
	            angular.forEach(immeubles, function (immeuble) {
                    if ( 
                    	 icontains(immeuble.PARTENAIRE.PROPRIETAIRE.GROUPE, predicate.owner) &&
                    	 icontains(immeuble.IDENTIFIANT.OBJECTIF, predicate.registerNb) &&
                    	 icontains(immeuble.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, predicate.place) &&
                    	 icontains(immeuble.IDENTIFIANT.NOM, predicate.buildingNb) &&
                    	 icontains(immeuble.IDENTIFIANT.ALIAS, predicate.address)
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
	angular.module('hb5').filter('immeubleListAnyFilter', [function () {
		
		return function (immeubles, searchtext) {

			var checkAnyField = function(immeuble,searchtext) {
				return (
					icontains(immeuble.PARTENAIRE.PROPRIETAIRE.GROUPE, searchtext) ||
					icontains(immeuble.IDENTIFIANT.OBJECTIF, searchtext) ||
					icontains(immeuble.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, searchtext) ||
					icontains(immeuble.IDENTIFIANT.NOM, searchtext) ||
					icontains(immeuble.IDENTIFIANT.ALIAS, searchtext)
				);		
			};			

	        if (!angular.isUndefined(immeubles) && !angular.isUndefined(searchtext)) {
	            var tempImmeubles = [ ];
	            angular.forEach(immeubles, function (immeuble) {
                    if ( checkAndForTokenisedSearchText(immeuble,searchtext,checkAnyField) ) {
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
	 * Filter tailored to UNITE_LOCATIVE (SURFACE) list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual uniteLocative list. 
	 */
	angular.module('hb5').filter('uniteLocativeListFilter', [function () {
		
		return function (uniteLocatives, predicate) {
	        if (!angular.isUndefined(uniteLocatives) && !angular.isUndefined(predicate)) {
	            var tempUniteLocatives = [ ];
	            angular.forEach(uniteLocatives, function (uniteLocative) {
	            	var currentOwner = undefined;
	            	if ( !angular.isUndefined(uniteLocative.PARTENAIRE) && 
            			 !angular.isUndefined(uniteLocative.PARTENAIRE.PROPRIETAIRE) ) {
	            		currentOwner = uniteLocative.PARTENAIRE.PROPRIETAIRE.VALUE;
	            	}
                    if ( 
                    	 icontains(currentOwner, predicate.owner) &&
                    	 icontains(uniteLocative.IDENTIFIANT.OBJECTIF, predicate.registerNb) 
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

		return function (uniteLocatives, searchtext) {
			
			var checkUniteLocative = function(uniteLocative, searchtext) {
				return (
						(
	    				!angular.isUndefined(uniteLocative.PARTENAIRE) && 
	    				!angular.isUndefined(uniteLocative.PARTENAIRE.PROPRIETAIRE) && 
	    				icontains(uniteLocative.PARTENAIRE.PROPRIETAIRE.VALUE, searchtext)
						) || icontains(uniteLocative.IDENTIFIANT.OBJECTIF, searchtext)
	    		);
			};			
			
	        if (!angular.isUndefined(uniteLocatives) && !angular.isUndefined(searchtext)) {
	            var tempUniteLocatives = [ ];
	            angular.forEach(uniteLocatives, function (uniteLocative) {
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
	 * Filter tailored to ACTEUR list requirements.
	 * Keeping 'Filter' postfix naming is useful to avoid naming conflict with actual actor list. 
	 */
	angular.module('hb5').filter('actorListFilter', [function () {
		
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
	        if (!angular.isUndefined(fontaines) && !angular.isUndefined(searchtext)) {
	            var tempFontaines = [ ];
	            angular.forEach(fontaines, function (fontaine) {
                    if ( 
                    	 icontains(fontaine.IDENTIFIANT.OBJECTIF, searchtext) ||
                    	 icontains(fontaine.IDENTIFIANT.NOM, searchtext) ||
                    	 icontains(fontaine.IDENTIFIANT.ALIAS, searchtext) || 
                    	 icontains(fontaine.DIVERS.REMARQUE, searchtext)
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