(function() {

	/**
	 * Small utility service intended to share functions not states between miscellaneous controllers
	 * without code duplication.
	 */
	
	angular.module('hb5').service('hbUtil', ['$log','$window','$filter','HB_API', 'HB_ORDER_LINE_TYPE', 'userDetails' ,function ($log,$window,$filter,HB_API,HB_ORDER_LINE_TYPE,userDetails) {

				
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
			if (elfin) {
	    		var currentCAR = _.find(elfin.CARACTERISTIQUE.CARSET.CAR, function(CAR){ return CAR.POS === pos; });
	    		return currentCAR;
			} else {
				return undefined;
			}
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
    			return getCByPos(currentL.C, CPos); 
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
		 * Inserts L entry at `index` in elfin.CARACTERISTIQUE.FRACTION.L 
		 * Takes care of POS renumbering to avoid discontinuous POS values. 
		 */
		var addFractionLByIndex = function(elfin, index, newL) {
			// Inserts L entry at index 
			elfin.CARACTERISTIQUE.FRACTION.L.splice(index,0,newL);
			// Renumber all POS of elfin.CARACTERISTIQUE.FRACTION.L array.
			renumberPos(elfin.CARACTERISTIQUE.FRACTION.L);
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
		
		/**
		 * Removes L entry having index from elfin.CARACTERISTIQUE.FRACTION.L
		 * Takes care of POS renumbering to avoid discontinuous POS values. 
		 */
		var removeFractionLByIndex = function(elfin, index) {

			// Remove L entry at index corresponding to LPos
			elfin.CARACTERISTIQUE.FRACTION.L.splice(index,1);
			// Renumber all POS of elfin.CARACTERISTIQUE.FRACTION.L array.
			renumberPos(elfin.CARACTERISTIQUE.FRACTION.L);
		};		
		
		/**
		 * Replaces L entry at `index` by `lEntry` in elfin.CARACTERISTIQUE.FRACTION.L
		 * Takes care of POS renumbering to avoid discontinuous POS values. 
		 */
		var replaceFractionLByIndex = function(elfin, index, lEntry) {

			// Replace L entry at index by lEntry 
			elfin.CARACTERISTIQUE.FRACTION.L[index] = lEntry;

			// Renumber all POS of elfin.CARACTERISTIQUE.FRACTION.L array.
			renumberPos(elfin.CARACTERISTIQUE.FRACTION.L);
		};		

		
		
		
		/**
		 * Replace FRACTION from CARACTERISTIQUE at elfin.CARACTERISTIQUE.FRACTION 
		 * Takes care of POS renumbering for all FRACTION.L to avoid inconsistent POS values. 
		 */
		var replaceFraction = function(elfin, newFraction) {
			// Replace FRACTION entry  
			elfin.CARACTERISTIQUE.FRACTION = newFraction;
			// Renumber all POS of elfin.CARACTERISTIQUE.FRACTION.L array.
			renumberPos(elfin.CARACTERISTIQUE.FRACTION.L);
		};		
		
		/**
		 * Expects keywords as an array of {"VALUE":"the keyword value"}
		 * Design for elfin.IDENTITIFIANT.MOTCLE but will work with any array of above objects such as: 
		 * [ {"VALUE":"my first value"}, {"VALUE":"my second value"} ]
		 */
		var getKeywordIndex = function(keywords, keywordValue) {
			var idx = -1;
			for ( var i = 0; i < keywords.length; i++) {
				var keyword = keywords[i];
				if (keyword.VALUE === keywordValue) {
					idx = i;
					break;
				}
			};
			return idx;
		};
		
		
		// ====================================================================
		//     Order specific FRACTION management
		// ====================================================================
		
		/**
		 * Produce a C entry valid in Order management context.
		 */
		var getLine = function(orderLineType, orderLineLabel, orderLineParameter, orderLineParameterLabel, orderLineValue, orderLineIsWithParameter ) {
			
			// L entry object
			var L = {
			    "C" : [ {
			      "POS" : 1,
			      "VALUE" : orderLineType
			    }, {
			      "POS" : 2,
			      "VALUE" : orderLineLabel
			    }, {
			      "POS" : 3,
			      "VALUE" : orderLineParameter
			    }, {
			      "POS" : 4,
			      "VALUE" : orderLineParameterLabel
			    }, {
			      "POS" : 5,
			      "VALUE" : orderLineValue
			    }, {
			      "POS" : 6,
			      "VALUE" : orderLineIsWithParameter
			    } ],
			    "POS" : 1
			  };
			
			return L;
		};
		
		var getOrderConfirmationLines = function() {
			
			var Ls = [
						getLine(HB_ORDER_LINE_TYPE.GROSS_AMOUNT_TOTAL, "Total brut", "", "", "0.00", "false" ),
						getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Rabais", "-0.00", "%", "", "true" ),
						getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Escompte", "-0.00", "%", "", "true" ),
						getLine(HB_ORDER_LINE_TYPE.NET_AMOUNT_TOTAL, "Total net", "", "", "0.00", "false" ),
						getLine(HB_ORDER_LINE_TYPE.APPLIED_AMOUNT, "Arrondi", "", "", "0.00", "false" ),						
						getLine(HB_ORDER_LINE_TYPE.TAX_RATE, "TVA", "8.00", "%", "", "true" ),
						getLine(HB_ORDER_LINE_TYPE.NET_AMOUNT_TOTAL_INCL_TAX, "Total net TTC adjugé", "", "", "0.00", "false" )
			    ];
			
			return Ls;
		};
			
	    var getOrderContractLines = function() {
			
			var Ls = [
						getLine(HB_ORDER_LINE_TYPE.GROSS_AMOUNT_TOTAL, "Total brut", "", "", "0.00", "false" ),
						getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Rabais", "-0.00", "%", "", "true" ),
						getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Escompte", "-0.00", "%", "", "true" ),
//						getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Prorata", "0.00", "%", "", "true" ),
//						getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Assurance TC", "0.00", "%", "", "true" ),
//						getLine(HB_ORDER_LINE_TYPE.APPLIED_AMOUNT, "Panneau de chantier", "", "", "0.00", "false" ),
						getLine(HB_ORDER_LINE_TYPE.NET_AMOUNT_TOTAL, "Total net", "", "", "0.00", "false" ),
						getLine(HB_ORDER_LINE_TYPE.APPLIED_AMOUNT, "Arrondi", "", "", "0.00", "false" ),						
						getLine(HB_ORDER_LINE_TYPE.TAX_RATE, "TVA", "8.00", "%", "", "true" ),
						getLine(HB_ORDER_LINE_TYPE.NET_AMOUNT_TOTAL_INCL_TAX, "Total net TTC adjugé", "", "", "0.00", "false" )
			    ];
			
			return Ls;
		}; 
	    	
	    var getOrderPurchaseLines = function() {
			
			var Ls = [ ];
			
			return Ls;
		}; 
		
		
		var getOrderConfirmationIntroduction = function() {
			return "Monsieur,\n\nVeuillez s'il vous plaît, exécuter les travaux selon votre OFFRE DU 01.01.1901 pour le montant suivant:";
		};
		
		var getOrderContractIntroduction = function() {
			return "";
		};
		
		var getOrderPurchaseIntroduction = function() {
			return "";
		};	
		
		var expectedCAR = [ 
		                   {
		                	   "POS" : 1,
		                	   "NOM" : "Introduction",
		                	   "UNITE" : "",
		                	   "VALEUR" : ""
		                   },
		                   {
		                	   "POS" : 2,
		                	   "NOM" : "Objet ou type de bâtiment et localisation",
		                	   "UNITE" : "",
		                	   "VALEUR" : ""
		                   }						    			                   
		                   ];
		
		var checkUpdateOrderCar = function(orderElfin) {
			
			/**
			 * We expect CAR array to be defined otherwise the catalog 
			 * must be reviewed.
			 */
			if (orderElfin.CARACTERISTIQUE.CARSET.CAR) {
				$log.debug(">>>> FOUND CAR array");
				var nbOfExistingEntries = orderElfin.CARACTERISTIQUE.CARSET.CAR.length;
				var nbOfExpectedEntries = expectedCAR.length;
				if (nbOfExistingEntries < nbOfExpectedEntries) {
    				$log.debug(">>>> FOUND CAR array length = " + nbOfExistingEntries + ", expected = " + nbOfExpectedEntries);
	    			for ( var i = nbOfExistingEntries; i < nbOfExpectedEntries; i++) {
	    				$log.debug(">>>> Trying to add " + angular.toJson(expectedCAR[i]));								    				
	    				orderElfin.CARACTERISTIQUE.CARSET.CAR.push(expectedCAR[i]);
	    			}
				} else {
					$log.debug(">>>> FOUND CAR array length = " + nbOfExistingEntries + ", expected = " + nbOfExpectedEntries + "NOTHING TO DO...");
				}
			} else {
				$log.debug(">>>> NOT FOUND CAR array /!\\");
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
		// JavaScript asynchronous processing utilities
		// ============================================================		

		/**
		 * Provides a new string token which satisfies `processMostRecentOnly` 
		 * compare tests. 
		 * 
		 * Checkout `processMostRecentOnly` implementation
		 * before using different token type. String was chosen instead 
		 * of numeric for XML persistence requirements, avoiding conversions. 
		 * 
		 * Token generation centralisation allow easy implementation 
		 * improvement if needed. 
		 */
		var getToken = function() { 
			return moment().format("YYYYMMDDHHmmssSSS"); 
		};


		/**
		 * Adds `token` at top of `tokensStack` 
		 */
		var addToTokensStack = function(token, tokensStack) {
			tokensStack.unshift(token);
		};
		
		/**
		 * Removes `token` from `tokensStack` and resize stack
		 * Note: currently not exposed as a service.
		 */
		var removeFromTokensStack = function(token, tokensStack) {
			var tokenIdx = -1;
			for (var i = 0; i < tokensStack.length; i++) {
				var currProcId = tokensStack[i];
				if ( currProcId === token) {
					tokenIdx = i;
					break;
				}
			}
			if (tokenIdx > -1) {
				tokensStack.splice(tokenIdx, 1);
			};
		};

		/**
		 * Empties `tokensStack`
		 * Note: currently not exposed as a service.
		 */
		var emptyTokensStack = function(tokensStack) {
			tokensStack = tokensStack.splice(0,tokensStack.length);
		};		
		
		/**
		 * Call `callBackFunction` with `callBackFunctionParam` when `token` 
		 * matches the most recent `token` from `tokensStack`.
		 * 
		 * `tokensStack` must be an array object managed as a stack using the following functions:
		 * `addToTokensStack(token, tokensStack)`
		 * `removeFromTokensStack(token, tokensStack)`
		 * `emptyTokensStack(tokensStack)`
		 */
		var processMostRecentOnly = function(token, tokensStack, callBackFunction, callBackFunctionParam) {
			
			//$log.debug(">>>> ");
			//$log.debug(">>>> token              = " + angular.toJson(token));
			//$log.debug(">>>> tokensStack BEFORE = " + angular.toJson(tokensStack));
			
			// ====================================================
			// proceed with or drop update algorithm
			// ====================================================
			// 
			// 1) If there is only one pending token
			if (tokensStack.length === 1) {
				//$log.debug(">>>> 1) ");
				
			// 1.1) We expected the last pending token to equal the received token
				if (tokensStack[0] === token) {
					// => proceed 
					callBackFunction.apply(this, callBackFunctionParam);
					// remove token
					removeFromTokensStack(token, tokensStack);	               						
				} else {
					// Do nothing. Unexpected.
				}
			// 2) If there is more than one pending token
			} else if (tokensStack.length > 1) {
				
				//$log.debug(">>>> 2) ");
				
				// 2.1) If the received token equals the most recent token 
				if (tokensStack[0] === token) {
					//$log.debug(">>>> 2.1) ");
					// => proceed
					callBackFunction.apply(this, callBackFunctionParam);
					// drop all remaining older tokens to prevent processing of older request 
					emptyTokensStack(tokensStack);
					// 2.2) If the received token does not equal the most recent token and is older
				} else if (tokensStack[0] > token) {
					//$log.debug(">>>> 2.2) ");
	   				// => drop and remove the token to prevent processing of older request 
					removeFromTokensStack(token, tokensStack);
				} else if (tokensStack[0] < token) {
					// 2.2) If the received update token does not equal the most recent token and is younger
					// Do nothing. Unexpected, most likely uncomplete management of addToTokensStack from 
					// calling code.
					$log.warn("Unexpected 'processMostRecentOnly' state 2.2). Possible uncomplete addToTokensStack implementation.");
				}
			// 3) If there is no pending update
			// => drop (regular situation)
			} else {
				//$log.debug(">>>> 3) ");
				// Do nothing. Ok.
			}
		
			//$log.debug(">>>> tokensStack AFTER  = " + angular.toJson(tokensStack));
			//$log.debug(">>>> ");
			
		};
		
		
		
		// ============================================================
		// JavaScript data structures utilities
		// ============================================================


		/**
		 * Test if object[property0][property1][...] exists.  
		 */
		var hasNestedProperty = function (object /*, property0, property1, ... */) {
			// Make an array of any argument following the object to test properties for.
			  var properties = Array.prototype.slice.call(arguments, 1);

			  // Test each nested property in turn 
			  for (var i = 0; i < properties.length; i++) {
				  var currProp = properties[i];
				  if (!object || !object.hasOwnProperty(currProp)) {
					  return false;
				  } else {
					  object = object[currProp];  
				  }
			  }
			  return true;
		};
		
		
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
        	getKeywordIndex:getKeywordIndex,
        	getLinkFileName:getLinkFileName,
        	getLinkFileApiUrl:getLinkFileApiUrl,
        	getMomentDateFromHbTextDateFormat:getMomentDateFromHbTextDateFormat,
        	getMomentDateFromHbTextDateTimeFormat:getMomentDateFromHbTextDateTimeFormat,
        	getMomentInHbTextFormat:getMomentInHbTextFormat,
        	getPrestationGroupForTransactionGroup:getPrestationGroupForTransactionGroup,
        	getToken:getToken,
        	getValueAtPath:getValueAtPath,
        	hasNestedProperty:hasNestedProperty,
        	isActionAuthorised:isActionAuthorised,
        	isValidDateFromHbTextDateFormat:isValidDateFromHbTextDateFormat,
        	isValidDateTimeFromHbTextDateTimeFormat:isValidDateTimeFromHbTextDateTimeFormat,
        	
        	addToTokensStack:addToTokensStack,
        	processMostRecentOnly:processMostRecentOnly,
        	
        	removeAnnexeRenvoiByPos:removeAnnexeRenvoiByPos,
        	addFractionLByIndex:addFractionLByIndex,
        	removeFractionLByPos:removeFractionLByPos,
        	removeFractionLByIndex:removeFractionLByIndex,
        	replaceFractionLByIndex:replaceFractionLByIndex,
        	
        	checkUpdateOrderCar:checkUpdateOrderCar,
        	getOrderConfirmationLines:getOrderConfirmationLines,
        	getOrderContractLines:getOrderContractLines,
        	getOrderPurchaseLines:getOrderPurchaseLines,
        	getOrderConfirmationIntroduction:getOrderConfirmationIntroduction,
        	getOrderContractIntroduction:getOrderContractIntroduction,
        	getOrderPurchaseIntroduction:getOrderPurchaseIntroduction,
        	
        	renumberPos:renumberPos,
        	reorderArrayByPOS:reorderArrayByPOS,
        	sortElfinByDEDescending:sortElfinByDEDescending
        };
    }]);
	
})();