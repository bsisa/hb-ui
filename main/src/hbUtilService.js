(function() {

	/**
	 * Small utility service intended to share functions not states between miscellaneous controllers
	 * without code duplication.
	 */
	
	angular.module('hb5').service('hbUtil', ['$log','$window','$filter','HB_API',function ($log,$window,$filter,HB_API) {

		
		
		// ============================================================
		// HyperBird authorisation related utilities
		// ============================================================		
		
		var isActionAuthorised  = function ( menuAction ) {
        	if ( angular.isDefined(menuAction) && angular.isDefined(menuAction.actionRights)) {
        		return _.contains(userDetails.getRoles(),menuAction.actionRights);
        	} else {
        		return true;
        	}
        };	
		
		
		
		// ============================================================
		// HyperBird GeoXML data structure to JSON utilities
		// ============================================================

		/**
		 * Get ELFIN/CARACTERISTIQUE/CARSET/CAR by CAR.POS (CAR@POS)
		 * instead of array position. If not found currentCAR === undefined
		 *  
		 * Note: Removing 1 from POS to get array pos is not 
		 * enough. POS element are not necessarily contiguous, 
		 * when a position is missing the following array 
		 * positions do not match XML POS values reliably.
		 */
		var getCARByPos = function(elfin, pos) {
    		var currentCAR = _.find(elfin.CARACTERISTIQUE.CARSET.CAR, function(CAR){ return CAR.POS === pos; });
    		return currentCAR;
		};
		
		
		/**
		 * Get C element given its position C.POS in the context of ELFIN/CARACTERISTIQUE/FRACTION/L/C 
		 * where Cs is an array of C elements/objects. 
		 */
		var getCByPos = function(Cs, CPos) {
			var searchedC = _.find(Cs, function(C){ return C.POS === CPos; });
			if (searchedC) {
				return searchedC;
			} else {
				return undefined;	
			}
		};
		
		/**
		 * Get ELFIN/CARACTERISTIQUE/FRACTION/L/C by L.POS C.POS (L@POS, CAR@POS)
		 * instead of array position. If not found currentC === undefined
		 *  
		 * Note: @see getCARByPos
		 */
		var getFractionLCByPos = function(elfin, LPos, CPos) {
    		var currentL = _.find(elfin.CARACTERISTIQUE.FRACTION.L, function(L){ return L.POS === LPos; });
    		if (currentL) {
    			return getCByPos(currentL.C);
    		} else {
    			return undefined;	
    		}
		};
		
		
		/**
		 * Get ELFIN/CARACTERISTIQUE/FRACTION/L by L.POS (L@POS)
		 * instead of array position. If not found currentL === undefined
		 *  
		 * Note: @see getCARByPos
		 */
		var getFractionLByPos = function(elfin, LPos) {
    		var currentL = _.find(elfin.CARACTERISTIQUE.FRACTION.L, function(L){ return L.POS === LPos; });
    		if (currentL) {
    			return currentL;
    		} else {
    			return undefined;	
    		}
		};			
		
		var getFractionLIndexByPos = function(elfin, LPos) {
			
			for (var i=0; i < elfin.CARACTERISTIQUE.FRACTION.L.length; i++) {
				var currL = elfin.CARACTERISTIQUE.FRACTION.L[i];
				if (currL.POS === LPos) {
					return i;
				}
			}
			return -1;
		};
		
		/**
		 * Removes L entry having POS attribute value LPos from elfin.CARACTERISTIQUE.FRACTION.L
		 * Takes care of POS renumbering to avoid discontinuous POS values. 
		 */
		var removeFractionLByPos = function(elfin, LPos) {
			var index = getFractionLIndexByPos(elfin, LPos);
			// Proceed only if we found a match for LPos
			if (index != -1) {
				// Remove L entry at index corresponding to LPos
				elfin.CARACTERISTIQUE.FRACTION.L.splice(index,1);
				// Renumber all POS of elfin.CARACTERISTIQUE.FRACTION.L array.
				renumberPos(elfin.CARACTERISTIQUE.FRACTION.L);
			}
		};
		
		
		
		var getAnnexeRenvoiIndexByPos = function(elfin, RenvoiPos) {
			
			for (var i=0; i < elfin.ANNEXE.RENVOI.length; i++) {
				var currRenvoi = elfin.ANNEXE.RENVOI[i];
				if (currRenvoi.POS === RenvoiPos) {
					return i;
				}
			}
			return -1;
		};		
		
		
		/**
		 * Removes RENVOI entry having POS attribute value RenvoiPos from elfin.ANNEXE.RENVOI
		 * Takes care of POS renumbering to avoid discontinuous POS values. 
		 */
		var removeAnnexeRenvoiByPos = function(elfin, RenvoiPos) {
			var index = getAnnexeRenvoiIndexByPos(elfin, RenvoiPos);
			// Proceed only if we found a match for RenvoiPos
			if (index != -1) {
				// Remove RENVOI entry at index corresponding to RenvoiPos
				elfin.ANNEXE.RENVOI.splice(index,1);
				// Renumber all POS of elfin.ANNEXE.RENVOI array.
				renumberPos(elfin.ANNEXE.RENVOI);
			}
		};			
		
		
        /**
         * Function used to renumber POS attributes for instance when element removal takes place.
         */
        var renumberPos = function(array) {
            if (!angular.isArray(array)) {
                return;
            }
            // Check every element has a POS property abort process otherwise.
            var haveAllPos = _.reduce(array, function(memo, element){ return (memo && (!_.isUndefined(element.POS)) ); }, true);
            if (!haveAllPos) {
            	return;
            } else {
                for (var i = 0; i < array.length; i++) {
                	var currentElement = array[i];
                	currentElement.POS = i+1; 
                }
            }
        }		
		
    	/**
    	 * Sort elfins by IDENTIFIANT.DE
    	 */
    	var sortElfinByDEDescending = function(elfins) {
    		elfins.sort(function(a, b) {
				return a.IDENTIFIANT.DE > b.IDENTIFIANT.DE ? -1 :
					a.IDENTIFIANT.DE < b.IDENTIFIANT.DE ? 1 : 0;
            });
    	};
    	
		
		// ============================================================
		// Date and time utilities
		// ============================================================
		
		// Date utilities =============================================
		
		var ISO_8601_DATE_FORMAT = "YYYY-MM-DD";
		
		/**
		 * Provide DateFormat for use by other libraries.
		 */
		var getDateFormat = function() {
			// Prevent modification by reference due to missing JS true constant.
			return deepCopy(ISO_8601_DATE_FORMAT);
		};		
		
		/**
		 * Returns JavaScript date corresponding to the `textDate`.
		 * 
		 * `textDate` parameter is a string expected to match 
		 * ISO_8601_DATE_FORMAT: YYYY-MM-DD 
		 * 
		 */
		var getDateFromHbTextDateFormat = function(textDate) {
			return moment(textDate, ISO_8601_DATE_FORMAT).toDate();
		};

		/**
		 * Returns a boolean result indicating whether `textDate`
		 * parameter is a valid string matching ISO_8601_DATE_FORMAT 
		 */
		var isValidDateFromHbTextDateFormat = function(textDate) {
			return moment(textDate, ISO_8601_DATE_FORMAT).isValid();
		};			
		
		/**
		 * Returns a string in ISO_8601_DATE_FORMAT: YYYY-MM-DD 
		 * corresponding to the provided JavaScript date parameter
		 */
		var getDateInHbTextFormat = function(date) {
			return moment(date).format(ISO_8601_DATE_FORMAT);
		};
		
		/**
		 * Returns MomentJS date corresponding to the `textDate`.
		 * 
		 * `textDate` parameter is a string expected to match 
		 * ISO_8601_DATE_FORMAT: YYYY-MM-DD 
		 * 
		 */		
		var getMomentDateFromHbTextDateFormat = function(textDate) {
			return moment(textDate, ISO_8601_DATE_FORMAT);
		};
		
		
		// DateTime utilities =============================================
		
		var ISO_8601_DATE_TIME_IN_UTC_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";		
		
		
		/**
		 * Provide DateTimeFormat for use by other libraries.
		 */
		var getDateTimeFormat = function() {
			// Prevent modification by reference due to missing JS true constant.
			return deepCopy(ISO_8601_DATE_TIME_IN_UTC_FORMAT);
		};
		
		/**
		 * Returns JavaScript date corresponding to the `textDateTime`.
		 * 
		 * `textDateTime` parameter is a string expected to match 
		 * ISO_8601_DATE_TIME_IN_UTC_FORMAT: YYYY-MM-DDTHH:mm:ssZ 
		 * 
		 */
		var getDateTimeFromHbTextDateTimeFormat = function(textDateTime) {
			return moment(textDateTime, ISO_8601_DATE_TIME_IN_UTC_FORMAT).toDate();
		};

		/**
		 * Returns a boolean result indicating whether `textDateTime`
		 * parameter is a valid string matching ISO_8601_DATE_TIME_IN_UTC_FORMAT 
		 */
		var isValidDateTimeFromHbTextDateTimeFormat = function(textDateTime) {
			return moment(textDateTime, ISO_8601_DATE_TIME_IN_UTC_FORMAT).isValid();
		};			
		
		/**
		 * Returns a string in ISO_8601_DATE_TIME_IN_UTC_FORMAT: YYYY-MM-DDTHH:mm:ssZ
		 * corresponding to the provided JavaScript date parameter
		 */
		var getDateTimeInHbTextFormat = function(date) {
			return moment(date).format(ISO_8601_DATE_TIME_IN_UTC_FORMAT);
		};		
		
		/**
		 * Returns a string in ISO_8601_DATE_TIME_IN_UTC_FORMAT: YYYY-MM-DDTHH:mm:ssZ
		 * corresponding to the provided MomentJS moment object `theMoment`
		 */
		var getMomentInHbTextFormat = function(theMoment) {
			return theMoment.format(ISO_8601_DATE_TIME_IN_UTC_FORMAT);
		};			
		
		/**
		 * Returns MomentJS date corresponding to the `textDateTime`.
		 * 
		 * `textDateTime` parameter is a string expected to match 
		 * ISO_8601_DATE_TIME_IN_UTC_FORMAT: YYYY-MM-DDTHH:mm:ssZ 
		 * 
		 */		
		var getMomentDateFromHbTextDateTimeFormat = function(textDateTime) {
			return moment(textDateTime, ISO_8601_DATE_TIME_IN_UTC_FORMAT);
		};		
		
		
		// ============================================================
		// JavaScript data structures utilities
		// ============================================================

		/**
		 * Provides object deep copy with type loss for date. 
		 */
		var deepCopy = function(object) {
			return angular.fromJson(angular.toJson(object));
		};
		
		
        /**
         * Sort any array by its elements POS property.
         * Assumes the array elements possess POS property of Int type.  
         */
        var reorderArrayByPOS = function(array) {
            array.sort(function(a, b) {
                return parseInt(a.POS) - parseInt(b.POS);
            });
        };		
                
        /**
         * Reads a source object property value defined at sourcePath.
         * Example: getValueAtPath(elfin, 'PARTENAIRE.FOURNISSEUR.VALUE')
         * `sourcePath` empty string is treated as `return source object itself` 
         */
        var getValueAtPath = function (source, sourcePath) {

        	if (!angular.isString(sourcePath) ) { // Path is expected to be a string.
        		return;
            } else if (sourcePath === '') { // Special processing for empty sourcePath.
        		return source;
        	} else {
                var sourcePathComponents = sourcePath.split('.');
                var objectRef = source;
                var value = null;
                var index;
                for (index = 0; index < sourcePathComponents.length; ++index) {
                    var pathElement = sourcePathComponents[index];
                    if (index == sourcePathComponents.length - 1) {
                    	// Get value at sourcePath
                    	value = objectRef[pathElement];
                    } else {
                        // Go down a level
                        objectRef = objectRef[pathElement];
                    }
                }
                return value;        		
        	}
        };        
                
        /**
         * Performs update of 'target' object property at 'path' with newValue 
         * given a target object a path defined JSON path as string and a new 
         * value to assign.
         * 
         * For instance: applyPath(elfin, 'IDENTIFIANT.NOM', 'Nouveau nom')
         * 
         */
        var applyPath = function(target, path, newValue) {
        	// The path is expected to be a string.
        	if (!angular.isString(path)) {
                  return;
            }
            var pathComponents = path.split('.');
            var objectRef = target;
            var index;
            for (index = 0; index < pathComponents.length; ++index) {
                var pathElement = pathComponents[index];
                if (index == pathComponents.length - 1) {
                	// Assign the new value
                    objectRef[pathElement] = newValue;
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
        };
        
        
        /**
         * Performs update of 'target' elfin object property at 'targetPath' with new value 
         * found at sourcePath of source elfin object.
         * 
         * For instance: applyPaths(elfin, 'IDENTIFIANT.NOM', elfinSource, 'GROUPE')
         * 
         */
        var applyPaths = function(target, targetPath, source, sourcePath) {
        	// Paths are expected to be strings.
        	if (!angular.isString(targetPath) && !angular.isString(sourcePath) ) {
                  return;
            }
        	// Special processing for targetPath empty string
        	if (targetPath === '') {
        		// Assign the new value directly to target object
        		target = getValueAtPath(source, sourcePath);
        	} else {
                var targetPathComponents = targetPath.split('.');
                var objectRef = target;
                var index;
                
                for (index = 0; index < targetPathComponents.length; ++index) {
                    var pathElement = targetPathComponents[index];
                    // Check for last level
                    if (index == targetPathComponents.length - 1) {
                    	// Assign the new value
                        objectRef[pathElement] = getValueAtPath(source, sourcePath);
                    } else {
                        // Go down a level
                        objectRef = objectRef[pathElement];
                    }
                }        		
        	}
        };
                

		// ============================================================
		// URI, URL utilities 
		// ============================================================
        
        /**
         * Encode a URL parameter with notable exception of single quote '.
         * 
         * Use encodeURIComponent to encode a URL parameter.
         * Do not use this on a full URL it will break it escaping forward slashes,...
         * encodeURI() can be used on URL instead.
         */
        var encodeUriParameter = function(uriParameter) {
        	return $window.encodeURIComponent(uriParameter);
        };
        
        /**
         * Builds a URL query string such as "?FIRST_PARAM=test&SECOND_PARAM=xxx"
         * where parameters is expected to be an array of objects with 
         * name and value properties.
         * 
         * The parameters are encoded. 
         */
        var buildUrlQueryString = function(parameters) {

	        var queryString = "";
	    	for (var i=0; i < parameters.length; i++) {
	    		var field = parameters[i];
	    		if (i===0) {
	    			queryString += "?" + field.name + "=" + encodeUriParameter(field.value);
	    		} else {
	    			queryString += "&" + field.name + "=" + encodeUriParameter(field.value);
	    		}
	    	}
	    	return queryString;
        };
        
        /**
         * Returns true if the provided 'sourceURI' string matches the rules
         * to consider it a valid sourceURI.
         * Note: rules are basic at the moment but the value of this function
         * is to centralise this logic in a single location.
         */
        var containsStandardSourceURI = function(sourceURI) {
        	if (sourceURI) {
        		var sourceURITokensArray = sourceURI.split('/');
        		if (sourceURITokensArray.length === 3) {
        			return true;
        		} else {
        			return false;
        		}
        	} else {
        		return false;
        	}
        };
        
        
        /**
         * If the provided 'sourceURI' satisfies containsStandardSourceURI() check then
         * it returns a result object with Id, ID_G, CLASSE properties set. 
         * Otherwise it returns undefined.
         */
        var getIdentifiersFromStandardSourceURI = function(sourceURI) {
        	if (containsStandardSourceURI(sourceURI)) {
        		var sourceURITokensArray = sourceURI.split('/');
        		var result = { 
        				"ID_G" : sourceURITokensArray[0],
        				"CLASSE" : sourceURITokensArray[1],
        				"Id" : sourceURITokensArray[2] 
        			};
        		return result;
    		} else {
    			return undefined;
    		}
        };        
        
        
        /**
         * Returns the dashboard URI in provided 'job' parameter if present and valid, '/' otherwise.
         */
        var getDashboarUri = function(job) {
        	// Check presence of dashboard URI in job configuration
        	if (job['CARACTERISTIQUE'] && job['CARACTERISTIQUE']['CAR2'] && job['CARACTERISTIQUE']['CAR2']['VALEUR']) {
        		var dashboardUriConfigValue = job['CARACTERISTIQUE']['CAR2']['VALEUR'];
        		// Check content of existing dashboard URI job configuration
        		if (dashboardUriConfigValue.startsWith('/') && (dashboardUriConfigValue.trim().length > 1) ) {
        			return dashboardUriConfigValue.trim();
        		} else {
        			return "/";
        		}
        	} else {
        		return "/";
        	}
        	
        };        
        
        /**
         * To use for XPath queries defined as Javascript string in angular/restangular 
         * context.
         * 
         * `+` sign can be found in XPath parameters such as ISO date string 
         * with time zone where separator is `+`.
         * 
         * This happen to be a problem as `+` corresponds to white space encoding thus if 
         * present in query such as:
         *  
         * ?_query=(...)+and+IDENTIFIANT/DE=%272015-02-01T22:00:00+01:00%27%5D
         * 
         * Where:                 %272015-02-01T22:00:00+01:00%27%5D
         * should be decoded to   : '2015-02-01T22:00:00+01:00']
         * but will be decoded to : '2015-02-01T22:00:00 01:00']
         * 
         * Note the plus sign being converted to white space which is wrong.
         * 
         * Pre-encoding the plus sign with escapePlusSign will solve the problem.
         * 
         */
        var escapePlusSign = function(string) {
			var plusSignEscapeChar = "%2B";
        	return string.replace("+", plusSignEscapeChar);
        };        
        
		// ============================================================
		// HyperBird catalog data conversion utilities
		// ============================================================

        /**
         * Transforms parameters array of objects with properties {label,name,value}
         * to a single object with {key1:value1, key2:value2, key3,value3} 
         * where names are mapped to keys and values to values.
         */
        var buildKeyValueObject = function(parameters) {
	        var keyValueObj = {};
	    	for (var i=0; i < parameters.length; i++) {
	    		var field = parameters[i];
	    		keyValueObj[field.name] = field.value;
	    	}
	    	return keyValueObj;
        };          
        
        /**
         * HyperBird catalogue default format is as follow: 
         * value1|value2|value3
         * The current function returns the above format as follow:
         * 
         * [
         *   {
         *     "name": "value1",
         *     "value": "value1"
         *   },
         *   {
         *     "name": "value2",
         *     "value": "value2"
         *   },
         *   {
         *     "name": "value3",
         *     "value": "value3"
         *   }   
         *  ]
         *  
         *  Although name and value are strictly identical in the current
         *  version the might differ if need arise, for instance for translating
         *  labels. This should be possible to implement in the current function
         *  without modifying code relying on name, value structure. 
         *  
         */
        var buildArrayFromCatalogueDefault = function(catalogueDefaultString) {
			var catalogueDefaultValuesArray = catalogueDefaultString.split("|");
			var jsonString = '[';
			for (var i = 0; i < catalogueDefaultValuesArray.length; i++) {
				jsonString += '{"name" : "' + catalogueDefaultValuesArray[i] + '", "value":' + '"' + catalogueDefaultValuesArray[i] + '"}';  
				if (i < (catalogueDefaultValuesArray.length - 1)) {
					jsonString += ',';
				}
			};
			jsonString += ']';
			var catalogueDefaultNameValueArray = angular.fromJson(jsonString);    
			return catalogueDefaultNameValueArray;
        };
        
        
        var buildDependencyArrayFromCatalogueDefault= function(catalogueDefaultString) {
			var catalogueDefaultValuesArray = catalogueDefaultString.split("|");
			var jsonString = '[';
			for (var i = 0; i < catalogueDefaultValuesArray.length; i++) {
				var catalogueDependencyToValueArray = catalogueDefaultValuesArray[i].split('::::');
				jsonString += '{"name" : "' + catalogueDependencyToValueArray[0] + '", "value":' + '"' + catalogueDependencyToValueArray[1] + '"}';  
				if (i < (catalogueDefaultValuesArray.length - 1)) {
					jsonString += ',';
				}
			};
			jsonString += ']';
			var catalogueDefaultNameValueArray = angular.fromJson(jsonString);    
			return catalogueDefaultNameValueArray;
        };                
        
		// ============================================================
		// Utilities related to ANNEXES
		// ============================================================        
        
        var getAnnexesExcludingTag = function(elfin, excludeTag) {
        	if (!(angular.isUndefined(elfin) || elfin===null) && !angular.isUndefined(elfin.ANNEXE) && !angular.isUndefined(elfin.ANNEXE.RENVOI)) {
        		var filterAnnexesRenvoi = $filter('annexExcludeTag')(elfin.ANNEXE.RENVOI, excludeTag);
        		return filterAnnexesRenvoi;
        	} else {
				return new Array();
			}
        };        
        
		/**
		 * Extracts file name for ANNEXE/RENVOI/LIEN corresponding to a photo.
		 * 
		 * Note: logic is currently basic and not strictly specific but may evolve thus 
		 * the dedicated function.
		 */
		var getLinkFileName = function (link) {
			var splitString = link.split('/');
			return splitString[splitString.length-1];
		};							               
		
		/**
		 * Build URL to get file for ANNEXE/RENVOI/LIEN from HyperBird API service.
		 */
		var getLinkFileApiUrl = function (elfinID_G, elfinId, link) {
			var url = HB_API.ANNEXE_URL+elfinID_G+"/"+elfinId+"/"+ getLinkFileName(link);
			return url;		
		};
        

		// ============================================================
		// Gespatri related utilities 
		// TODO: move to hbGespatriUtilService
		// ============================================================		
		
        /**
         * Copy ECHEANCE object from catalogueConstat return it with default values set. 
         */
        var getEcheanceTemplateFromCatalogue = function(catalogueConstat) {
	        var constatEcheanceTemplate = catalogueConstat.ACTIVITE.EVENEMENT.ECHEANCE[0];
	        var currentDateHbTextFormat = getDateInHbTextFormat(new Date());
	        constatEcheanceTemplate.DATE=currentDateHbTextFormat;
	        constatEcheanceTemplate.ACTION=""; 
	        constatEcheanceTemplate.PAR_QUI="EN COURS"; 
	        constatEcheanceTemplate.POUR_QUI="";
	        constatEcheanceTemplate.E_DATE=currentDateHbTextFormat;;
	        constatEcheanceTemplate.E_ACTION="";
	        constatEcheanceTemplate.E_PAR_QUI="0";
	        constatEcheanceTemplate.E_POUR_QUI="";
	        constatEcheanceTemplate.E_STATUT="OK";
	        constatEcheanceTemplate.REMARQUE="";
	        // TODO: manage POS value at insert time (.length + 1) and possibly at delete time (more complicated :) )
	        constatEcheanceTemplate.POS=1;	
	        
	        return constatEcheanceTemplate;
        };
        
		/**
		 * Maps TRANSACTION.GROUPE to PRESTATION.GROUPE
		 */
		var getPrestationGroupForTransactionGroup = function (transactionGroup) {
			
			// Protect against catalogue initialisation multiple choice strings (pipe separated).
			if (transactionGroup.indexOf("|") > -1) {
				return "";
			} else { // Proceed
				var prestationGroup = null;
	    		if (transactionGroup === "Petite réparation") {
	    			prestationGroup = 'Fonctionnement';
	    		} else if (transactionGroup === "Frais fixe" || transactionGroup === "Frais fixes") {
	    			prestationGroup = "Fonctionnement";
	    		} else if (transactionGroup === "Investissement pluriannuel") {
	    			prestationGroup = "Investissement";
	    		} else {
	    			prestationGroup = transactionGroup;
	    		}
				return prestationGroup;				
			}
		};

		
		/**
		 * Custom `unsafe` file system access. Requires modern browsers security modification in order to be effective.
		 * Implementation taken from HB4 `hbfiche_displayFolder(melfin)` used by HB4 `getHB_Fiche().showAnnexeWindow(uri,uri)`  
		 */
		var buildAnnexeFileSystemUri = function(elfin_p) {
			if (elfin_p) {
				try {
					var uri = undefined;
					var owner = elfin_p.PARTENAIRE.PROPRIETAIRE.NOM; 
					if (owner === "NE") {
						uri = "\\\\H\:\\3-BATIMENTS-DOSSIERS\\BATIMENTS\\";
					} else if (owner === "FMPA") {
						uri = "\\\\H\:\\3-BATIMENTS-DOSSIERS\\FMPA\\";
					} else if (owner === "CDP") {
						uri = "\\\\H\:\\3-BATIMENTS-DOSSIERS\\PREVOYANCE.NE\\";
					} else if (owner === "DOM") {
						uri = "\\\\H\:\\3-BATIMENTS-DOSSIERS\\DOMAINES\\";
					} else if (owner === "ETAT") {
						uri = "\\\\H\:\\3-BATIMENTS-DOSSIERS\\BATIMENTS\\";
					} else if (owner === "VITEOS") {
						uri = "\\\\H\:\\3-BATIMENTS-DOSSIERS\\VITEOS\\";
					}
					var name = elfin_p.IDENTIFIANT.NOM; 
					var address = elfin_p.IDENTIFIANT.ALIAS;
				    address = address.replace(new RegExp("[àâä]","ig"),"a");
				    address = address.replace(new RegExp("[éèêë]","ig"),"e");
				    address = address.replace(new RegExp("[îï]","ig"),"i");
				    address = address.replace(new RegExp("[ôö]","ig"),"o");
				    address = address.replace(new RegExp("[ùûü]","ig"),"u");
				    var street = "_" + address.split(', ')[1];
				    if (street == "_undefined") street = "";
				    uri += name + "_" + address.split(', ')[0] +  street;
					return uri;
				} catch (e) {
					$log.debug("Non critical failure for buildAnnexeFileSystemUri(elfin_p.Id = " + elfin_p.Id +"). Exception: " + e);
					return "";
				}
			} else {
				return "";
			}

		};		
		
		
        
        return {
        	applyPath:applyPath,
        	applyPaths:applyPaths,
        	buildAnnexeFileSystemUri:buildAnnexeFileSystemUri,
        	buildArrayFromCatalogueDefault:buildArrayFromCatalogueDefault,
        	buildDependencyArrayFromCatalogueDefault:buildDependencyArrayFromCatalogueDefault,
        	buildKeyValueObject:buildKeyValueObject,
        	buildUrlQueryString:buildUrlQueryString,
        	containsStandardSourceURI:containsStandardSourceURI,
        	getDashboarUri:getDashboarUri,
        	deepCopy:deepCopy,
        	encodeUriParameter:encodeUriParameter,
        	getAnnexesExcludingTag:getAnnexesExcludingTag,
        	getCARByPos:getCARByPos,
        	getCByPos:getCByPos,
        	getDateFormat:getDateFormat,
        	getDateInHbTextFormat:getDateInHbTextFormat,
        	getDateTimeFormat:getDateTimeFormat,
        	getDateTimeInHbTextFormat:getDateTimeInHbTextFormat,
        	getDateFromHbTextDateFormat:getDateFromHbTextDateFormat,
        	getDateTimeFromHbTextDateTimeFormat:getDateTimeFromHbTextDateTimeFormat,
        	getEcheanceTemplateFromCatalogue:getEcheanceTemplateFromCatalogue,
        	getFractionLByPos:getFractionLByPos,
        	getFractionLIndexByPos:getFractionLIndexByPos,
        	getFractionLCByPos:getFractionLCByPos,
        	getIdentifiersFromStandardSourceURI:getIdentifiersFromStandardSourceURI,
        	getLinkFileName:getLinkFileName,
        	getLinkFileApiUrl:getLinkFileApiUrl,
        	getMomentDateFromHbTextDateFormat:getMomentDateFromHbTextDateFormat,
        	getMomentDateFromHbTextDateTimeFormat:getMomentDateFromHbTextDateTimeFormat,
        	getMomentInHbTextFormat:getMomentInHbTextFormat,
        	getPrestationGroupForTransactionGroup:getPrestationGroupForTransactionGroup,
        	getValueAtPath:getValueAtPath,
        	isActionAuthorised:isActionAuthorised,
        	isValidDateFromHbTextDateFormat:isValidDateFromHbTextDateFormat,
        	isValidDateTimeFromHbTextDateTimeFormat:isValidDateTimeFromHbTextDateTimeFormat,
        	removeAnnexeRenvoiByPos:removeAnnexeRenvoiByPos,
        	removeFractionLByPos:removeFractionLByPos,
        	renumberPos:renumberPos,
        	reorderArrayByPOS:reorderArrayByPOS,
        	sortElfinByDEDescending:sortElfinByDEDescending
        	
        };
    }]);
	
})();