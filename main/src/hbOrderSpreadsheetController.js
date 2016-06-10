(function() {

	
	/**
	 * HbOrderSpreadsheetController definition.
	 * 
	 */
	angular.module('hb5').controller(
			'HbOrderSpreadsheetController',
			[ 		'$attrs',
					'$scope',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'$timeout',
					'hbAlertMessages',
					'hbUtil',
					'GeoxmlService',
					'hbQueryService',
					'HB_REGEXP',
					'HB_ORDER_LINE_TYPE',
					function($attrs, $scope, $modal, $routeParams,
							$location, $log, $timeout, hbAlertMessages, hbUtil, GeoxmlService, hbQueryService, HB_REGEXP, HB_ORDER_LINE_TYPE) {

				//$log.debug(">>>> HbOrderSpreadsheetController...");				

				$scope.selected = { "lineType" : {} };
				
				// ========== processMostRecentOnly optimisation ==============

				// Init computation stack to empty array.
				$scope.orderLinesComputationsStack = new Array();				
				
				/**
				 * Proceed with model update and view refresh if computation effectively 
				 * lead to any model change.
				 */
				var proceedWithUpdateOnChange = function(updatedCaracteristique) {
					
       				if ( diffUpdate($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE, updatedCaracteristique) ) {
           				// Notify view of model update.
           				$scope.ngModelCtrl.$render();		               				
           				$scope.elfinForm.$setDirty();
       				} else {
       					// Do nothing. 
       					// $log.debug(">>>> no diff, no update.");
       				};										
				}
				
				// ============================================================
				
				
				/**
				 * Constants used in L data model:
				 * 
				 * <L POS="x">
				 * 	<C POS="1">MANUAL_AMOUNT</C>
				 * 	<C POS="2">A description...</C>
				 * 	<C POS="3"/>
				 * 	<C POS="4"/>
				 * 	<C POS="5">500.00</C>
				 * 	<C POS="6">false</C>
				 * </L>
				 */
				var ORDER_LINE_TYPE_POS = 1;
				var ORDER_LINE_PARAM_POS = 3;
				var ORDER_LINE_AMOUNT_POS = 5;				
				
				// Expose HB_ORDER_LINE_TYPE constants to scope for use in view.
				$scope.HB_ORDER_LINE_TYPE = HB_ORDER_LINE_TYPE;
				
				//$scope.EMPTY = "EMPTY";
				//$scope.MANUAL_AMOUNT = "MANUAL_AMOUNT";
				//$scope.GROSS_AMOUNT_TOTAL = "TOTAL_GROSS";
				
				//$scope.REDUCTION_RATE = "REDUCTION_RATE";
				//$scope.DISCOUNT_RATE = "DISCOUNT_RATE";
				//$scope.ROUNDING_AMOUNT = "ROUNDING_AMOUNT";
				//$scope.VAT_RATE = "VAT_RATE";
				
				//$scope.APPLIED_RATE = "APPLIED_RATE"; // Reduction (-), discount (-), VAT (+), ...
				//$scope.APPLIED_AMOUNT = "APPLIED_AMOUNT"; // Rounding (+/-), ...
				
				//$scope.NET_AMOUNT_TOTAL = "TOTAL_NET";

				var getLine = function(orderLineType, orderLineLabel, orderLineParameter, orderLineParameterLabel, orderLineValue, orderLineIsWithParameter ) {
					
					// Return L as object on text type.
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
				

				$scope.lineTypes = [
				                    getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Rabais", "-0.00", "%", "", "true" ),
				                    getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Escompte", "-0.00", "%", "", "true" ),
//				                    getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "TVA", "8.00", "%", "", "true" ), // Not relevant
				                    getLine(HB_ORDER_LINE_TYPE.APPLIED_RATE, "Autre taux...", "0.00", "%", "", "true" ),
				                    getLine(HB_ORDER_LINE_TYPE.APPLIED_AMOUNT, "Arrondi", "", "", "0.00", "false" ),
				                    getLine(HB_ORDER_LINE_TYPE.APPLIED_AMOUNT, "Autre montant...", "", "", "0.00", "false" )
				                   ];				
				
				/**
				 * Expose constant to scope
				 */				
				//$scope.numericOnlyRegexp = HB_REGEXP.NUMERIC_POS_ONLY;
				$scope.numericOnlyRegexp = HB_REGEXP.NUMERIC_POS_AND_NEG_ONLY;


				$scope.isNeg = function(num) {
					return (num < 0);
				};
				
				/**
				 * Reference to hb-single-select ng-model sibling directive controller
				 */
				$scope.ngModelCtrl = null;


				/**
				 * ngModel controller scope reference setter.
				 */
				this.setNgModelCtrl = function(ctrl) {
					$scope.ngModelCtrl = ctrl;						
				};


				/**
				 * Check if model and associated CARACTERISTIQUE data is available.
				 */
				var isCaracteristiqueAvailable = function() {
					return ($scope.ngModelCtrl !== null && $scope.ngModelCtrl.$modelValue !== null && $scope.ngModelCtrl.$modelValue.CARACTERISTIQUE)
				};


				/**
				 * Listener defining and updating $scope.hasManualOrderLine boolean value
				 */
				$scope.$watch('ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L', function() {
										
					if (isCaracteristiqueAvailable()) {
						// Encapsulate two level deep underscorejs _.find 
						$scope.hasManualOrderLine = _.find( 
								// Loop on array of Ls (lines)
								$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L, 
								function(L){ 
									// Loop on array of Cs (cells)
									var manualAmtCell =_.find( L.C, function(C) { return ( C.POS === 1 && C.VALUE === HB_ORDER_LINE_TYPE.MANUAL_AMOUNT) } );
									return ( manualAmtCell !== undefined) 
								}
							);
					} else { 
						// Nada
					};
				}, true);				


				/**
				 * Listens to computation relevant only CARACTERISTIQUE.FRACTION.L model changes
				 * Used to minimise calls to order lines computation service.   
				 */
				$scope.$watch(
						function () {
							var res = [];
							if (isCaracteristiqueAvailable()) {
								res = orderWatchedData($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L);
							};
							return res; 
						},
						function (newWatchedData, oldWatchedData) {
							//$log.debug("orderWatchedData watch event \noldWatchedData >> " + angular.toJson(oldWatchedData) + "\nnewWatchedData >> " + angular.toJson(newWatchedData));
							$scope.updateOrderLines($scope.elfinForm.$valid);
						},
						true);
				

				/**
				 * Boolean expression to make order line value conditionally editable
				 */
				$scope.lineValueEditable = function(line) {
					var isLineValueEditable = (line.C[0].VALUE === HB_ORDER_LINE_TYPE.MANUAL_AMOUNT) || (line.C[0].VALUE === HB_ORDER_LINE_TYPE.APPLIED_AMOUNT) || ((line.C[0].VALUE === HB_ORDER_LINE_TYPE.GROSS_AMOUNT_TOTAL) && !$scope.hasManualOrderLine );
					return isLineValueEditable;
				};
				
				/**
				 * Boolean expression to make order line label conditionally editable
				 */
				$scope.lineLabelEditable = function(line) {
					var isLineLabelEditable = !(
							(line.C[0].VALUE === HB_ORDER_LINE_TYPE.APPLIED_AMOUNT && line.C[1].VALUE === 'Arrondi') || // Exception introduced by end user request. 
							(line.C[0].VALUE === HB_ORDER_LINE_TYPE.GROSS_AMOUNT_TOTAL) || 
							(line.C[0].VALUE === HB_ORDER_LINE_TYPE.NET_AMOUNT_TOTAL) || 
							(line.C[0].VALUE === HB_ORDER_LINE_TYPE.NET_AMOUNT_TOTAL_INCL_TAX) ||
							(line.C[0].VALUE === HB_ORDER_LINE_TYPE.TAX_RATE) ||
							(line.C[0].VALUE === HB_ORDER_LINE_TYPE.EMPTY));
					return isLineLabelEditable;
				};				
				

				/**
				 * Provides dynamic style info to ng-class expression.
				 */
				$scope.amountStyleClass = function (line) {
					if (!$scope.lineLabelEditable(line)) {
						return "order-sum";
					} else {
						return "";
					}
				}
				
				/**
				 * Call HB-API service to obtain order lines computation.
				 * As HB-API processing is asynchronous there is no guarantee that responses
				 * are returned in the same order than requests were submitted.
				 * Use FIFO logic of `updateToken` to only proceed with most recent update and
				 * drop any old pending requests to prevent backward model updates.   
				 */
				$scope.updateOrderLines = function(formValid) {
					
					if (formValid && isCaracteristiqueAvailable()) {
						var restGeoxml = GeoxmlService.getService();				
						
						// Update computation token
						if (angular.isDefined($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6)) {
							$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6.VALEUR = "" + hbUtil.getToken() + "";
						} else {
							$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6 = {
								      "NOM" : "OrderLine computation request token",
								      "UNITE" : "",
								      "VALEUR" : "" + hbUtil.getToken() + ""
								    }
						}
						
						// Add computation token to stack
						hbUtil.addToTokensStack($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6.VALEUR, $scope.orderLinesComputationsStack);
						
						// Asynchronous call (promise/future)
		        		restGeoxml.all("orders/compute/order-lines").post($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE).then( 
		               			function(updatedCaracteristique) {
		               				var receivedUpdateToken = updatedCaracteristique.CAR6.VALEUR;
               						hbUtil.processMostRecentOnly(receivedUpdateToken, $scope.orderLinesComputationsStack, proceedWithUpdateOnChange, [updatedCaracteristique]);
		    	       			}, 
		    	       			function(response) { 
		    	       				// Reset pending requests stack to avoid keeping track of failing request
		    	       				$scope.orderLinesComputationsStack.splice(0,$scope.orderLinesComputationsStack.length);
		    	       				
		    	       				$log.debug("Error in computeOrderLines POST operation with status code", response.status);
		    	       				var message = "Le calcul du montant de commande a échoué. Corrigez s.v.p. votre saisie. Si le problème persiste, veuillez contacter l'administrateur système.";
		    						hbAlertMessages.addAlert("danger",message);
		    	       			}
		            		);			
					} else {
						// Nada - Do not submit invalid data.
					}
				};				


				/**
				 * Updates any localCar value different from newCar.
				 * 
				 * Updates are performed by reference.
				 * 
				 * Returns true if anything has been updated false otherwise. 
				 * 
				 * Used to avoid annoying model lost focus and irrelevant $dirty state effects. 
				 */				
				var diffUpdate = function (localCar, newCar) {
					
					var hasPerformedUpdate = false;
					
					for (var i = 0; i < localCar.FRACTION.L.length; i++) {
						var currentLine = localCar.FRACTION.L[i];
						var localLineTypeCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_TYPE_POS);
						var localLineParamCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_PARAM_POS);
						var localLineAmountCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_AMOUNT_POS);
						
						var newLine = newCar.FRACTION.L[i];
						var newLineTypeCell = hbUtil.getCByPos(newLine.C, ORDER_LINE_TYPE_POS);
						var newLineParamCell = hbUtil.getCByPos(newLine.C, ORDER_LINE_PARAM_POS);
						var newLineAmountCell = hbUtil.getCByPos(newLine.C, ORDER_LINE_AMOUNT_POS);						
						
						// Reduce logic on client side: Only check for value differences
						// If the new cell value changed update local value.
						if (localLineAmountCell.VALUE !== newLineAmountCell.VALUE) {
							localLineAmountCell.VALUE = newLineAmountCell.VALUE;
							if (!hasPerformedUpdate) { hasPerformedUpdate = true; }
						}
					}
					
					return hasPerformedUpdate;
				}
				
				
				/**
				 * Build an array of array containing primitive values for which 
				 * changes must trigger order amounts computation. 
				 */
				var orderWatchedData = function (L) {
					
					var auditedData = [];
					
					for (var i = 0; i < L.length; i++) {
						var auditedCell = [];
						var currentLine = L[i];
						var localLineTypeCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_TYPE_POS);
						var localLineParamCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_PARAM_POS);
						var localLineAmountCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_AMOUNT_POS);

						// Gross amount change triggers computation only when input by user
						if (localLineTypeCell.VALUE === HB_ORDER_LINE_TYPE.GROSS_AMOUNT_TOTAL && !$scope.hasManualOrderLine) {
							auditedCell.push(localLineTypeCell.VALUE);
							auditedCell.push(localLineAmountCell.VALUE);
						};
						
						// Manual and rounding amount change are input by user and must trigger computation
						if (
								localLineTypeCell.VALUE === HB_ORDER_LINE_TYPE.APPLIED_AMOUNT ||
								localLineTypeCell.VALUE === HB_ORDER_LINE_TYPE.MANUAL_AMOUNT) {
							
							auditedCell.push(localLineTypeCell.VALUE);
							auditedCell.push(localLineAmountCell.VALUE);							
						};
						
						// Rate parameter cell value change is input by user and must trigger computation
						if (
								localLineTypeCell.VALUE === HB_ORDER_LINE_TYPE.TAX_RATE ||
								localLineTypeCell.VALUE === HB_ORDER_LINE_TYPE.APPLIED_RATE) {
							
							auditedCell.push(localLineTypeCell.VALUE);
							auditedCell.push(localLineParamCell.VALUE);
							
						};
						
						// Net amount total is never input by user and must not trigger computation
						
						// Push record
						auditedData.push(auditedCell);
					}
					return auditedData;
				}				
				
				
				/**
				 * Adds a `manual entry` order line
				 */
				$scope.addLine = function (index, formValid) {

					var L = {
						          "C" : [ {
						            "POS" : 1,
						            "VALUE" : HB_ORDER_LINE_TYPE.MANUAL_AMOUNT
						          }, {
						            "POS" : 2,
						            "VALUE" : "Description"
						          }, {
						            "POS" : 3,
						            "VALUE" : ""
						          }, {
						            "POS" : 4,
						            "VALUE" : ""
						          }, {
						            "POS" : 5,
						            "VALUE" : "0.00"
						          }, {
						            "POS" : 6,
						            "VALUE" : "false"
						          } ],
						          "POS" : 1
						        };

					// Add new line
					hbUtil.addFractionLByIndex($scope.ngModelCtrl.$modelValue,index,L);
					// Perform computation and update
					$scope.updateOrderLines(formValid);
					// Notify Form of model model change
       				$scope.elfinForm.$setDirty();
				};
				
				
				/**
				 * Adds a user selected entry {APPLIED_RATE, APPLIED_AMOUNT} to orders line, applied to GROSS_AMOUNT 
				 */
				$scope.addEmptyLine = function (index, formValid) {

					var L = {
						          "C" : [ {
						            "POS" : 1,
						            "VALUE" : HB_ORDER_LINE_TYPE.EMPTY
						          }, {
						            "POS" : 2,
						            "VALUE" : ""
						          }, {
						            "POS" : 3,
						            "VALUE" : ""
						          }, {
						            "POS" : 4,
						            "VALUE" : ""
						          }, {
						            "POS" : 5,
						            "VALUE" : "0.00"
						          }, {
						            "POS" : 6,
						            "VALUE" : "false"
						          } ],
						          "POS" : 1
						        };

					// Add new line
					hbUtil.addFractionLByIndex($scope.ngModelCtrl.$modelValue,index,L);
					// Note: No computation nor update necessary
					// Notify Form of model model change
       				$scope.elfinForm.$setDirty();
				};				
				
				
				/**
				 * Replace an order line by provided newLine. 
				 * New line is expected to match user drop down selected 
				 * entry {APPLIED_RATE, APPLIED_AMOUNT}
				 */
				$scope.replaceLine = function (index, newLine_p, formValid) {

					var newLine = hbUtil.deepCopy(newLine_p);
					
					// Replace by new line
					hbUtil.replaceFractionLByIndex($scope.ngModelCtrl.$modelValue, index, newLine);
					// Perform computation and amounts update
					$scope.updateOrderLines(formValid);
					// Avoid preserving selected.lineType state
					$scope.selected.lineType = "";
				};				
				
				
				/**
				 * Removes a `manual entry` order line
				 */
				$scope.removeLine = function (index, formValid) {
					// Remove order line at `index`
					hbUtil.removeFractionLByIndex($scope.ngModelCtrl.$modelValue,index);
					// Perform computation and amounts update
					$scope.updateOrderLines(formValid);
				};

			} ]); // End of HbOrderSpreadsheetController definition
        
})();
