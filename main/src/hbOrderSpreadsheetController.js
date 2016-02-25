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
					function($attrs, $scope, $modal, $routeParams,
							$location, $log, $timeout, hbAlertMessages, hbUtil, GeoxmlService, hbQueryService, HB_REGEXP) {

				//$log.debug(">>>> HbOrderSpreadsheetController...");				

				// Init computation stack to empty array.
				$scope.orderLinesComputationsStack = new Array();

				// ============================================================
				// Computation stack related functions
				// ============================================================				
				
				/**
				 * Adds `updateToken` at top of stack 
				 */
				var addToComputationStack = function(updateToken) {
					$scope.orderLinesComputationsStack.unshift(updateToken);
				};
				
				/**
				 * Removes `updateToken` from and resize stack
				 */
				var removeFromComputationStack = function(processingId) {
					var processingIdIdx = -1;
					for (var i = 0; i < $scope.orderLinesComputationsStack.length; i++) {
						var currProcId = $scope.orderLinesComputationsStack[i];
						if ( currProcId === processingId) {
							processingIdIdx = i;
							break;
						}
					}
					if (processingIdIdx > -1) {
						$scope.orderLinesComputationsStack.splice(processingIdIdx, 1);
					};
				};

				/**
				 * Empties stack
				 */
				var emptyComputationStack = function() {
					$scope.orderLinesComputationsStack = new Array();
				};

				// ============================================================
				

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
       					//$log.debug(">>>> no diff, no update.");
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
				
				$scope.MANUAL_AMOUNT = "MANUAL_AMOUNT";
				$scope.GROSS_AMOUNT_TOTAL = "TOTAL_GROSS";
				$scope.REDUCTION_RATE = "REDUCTION_RATE";
				$scope.DISCOUNT_RATE = "DISCOUNT_RATE";
				$scope.ROUNDING_AMOUNT = "ROUNDING_AMOUNT";
				$scope.VAT_RATE = "VAT_RATE";
				$scope.NET_AMOUNT_TOTAL = "TOTAL_NET";


				/**
				 * Expose constant to scope
				 */				
				$scope.numericOnlyRegexp = HB_REGEXP.NUMERIC_POS_ONLY;


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
									var manualAmtCell =_.find( L.C, function(C) { return ( C.POS === 1 && C.VALUE === $scope.MANUAL_AMOUNT) } );
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
					return (line.C[0].VALUE === $scope.MANUAL_AMOUNT) || (line.C[0].VALUE === $scope.ROUNDING_AMOUNT) || ((line.C[0].VALUE === $scope.GROSS_AMOUNT_TOTAL) && !$scope.hasManualOrderLine )
				};
				
				
				/**
				 * Call HB-API service to obtain order lines computation.
				 */
				$scope.updateOrderLines = function(formValid) {
					
					if (formValid && isCaracteristiqueAvailable()) {
						var restGeoxml = GeoxmlService.getService();				
						
						// Update computation token
						if (angular.isDefined($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6)) {
							$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6.VALEUR = "" + moment().format("YYYYMMDDHHmmssSSS") + "";
							//$log.debug(">>>> SEND >>>> ORDER LINES id, CARACTERISTIQUE.CAR6.VALEUR = " + $scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6.VALEUR);							
						} else {
							//$log.debug(">>>> SEND >>>> ORDER LINES id, CARACTERISTIQUE.CAR6.VALEUR NOT AVAILABLE CREATING...");
							$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6 = {
								      "NOM" : "OrderLine Id",
								      "UNITE" : "",
								      "VALEUR" : "" + moment().format("YYYYMMDDHHmmssSSS") + ""
								    }
							//$log.debug(">>>> SEND >>>> ORDER LINES id, CARACTERISTIQUE.CAR6.VALEUR = " + $scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6.VALEUR);
						}
						
						// Add computation token to stack
						addToComputationStack($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.CAR6.VALEUR);
						
						// Asynchronous call (promise/future)
		        		restGeoxml.all("orders/compute/order-lines").post($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE).then( 
		               			function(updatedCaracteristique) {
		               				var receivedUpdateToken = updatedCaracteristique.CAR6.VALEUR;
		               				//$log.debug(">>>> RECV >>>> ORDER LINES id, POS6.VALEUR = " + receivedUpdateToken);
		               				// ====================================================
		               				// proceed with or drop update algorithm
		               				// ====================================================
		               				// 
		               				// 1) If there is only one pending update
		               				if ($scope.orderLinesComputationsStack.length === 1) {
		               					
			               				// 1.1) If the pending update token equals the received update token
		               					if ($scope.orderLinesComputationsStack[0] === receivedUpdateToken) {
		               						// => proceed with update
		               						proceedWithUpdateOnChange(updatedCaracteristique);
		               						// remove token
		               						removeFromComputationStack(receivedUpdateToken);	               						
		               						//$log.debug(">>>> Proceed with or drop update algorithm: OK - 1.1) ");
			               				// 1.2) If the pending update token does not equal the received update token
			               				// => unexpected: drop and notify the user of possible data inconsistency and log...
		               					} else {
		               						//TODO: end user notification ?
				    	       				var message = "Le calcul du montant de commande peut comporter des incohérences. Veuillez vérifier et informer l'administrateur de l'application.";
				    						hbAlertMessages.addAlert("danger",message);
		               						$log.warn(">>>> Proceed with or drop update algorithm: !! - 1.2) pending update token does not equal the received update token!");
		               					}

		               				//
		               				// 2) If there is more than one pending update
		               				} else if ($scope.orderLinesComputationsStack.length > 1) {
			               				// 2.1) If the received update token equals the most recent token 
		               					if ($scope.orderLinesComputationsStack[0] === receivedUpdateToken) {
		               						// => proceed with update
		               						proceedWithUpdateOnChange(updatedCaracteristique);
		               						// drop all remaining older tokens to prevent backward updates
		               						emptyComputationStack();
			               					//$log.debug(">>>> Proceed with or drop update algorithm: OK - 2.1) ");		               						
			               				// 2.2) If the received update token does not equal the most recent token and is older
		               					} else if ($scope.orderLinesComputationsStack[0] > receivedUpdateToken) {
				               				// 2.2.1) If found
				               				// => drop and remove the token to prevent backward updates
			               					//$log.debug(">>>> Proceed with or drop update algorithm: OK - 2.2.1) ");
				               				// 2.2.2) else 
				               				// => drop (regular situation (debug log)
			               					//$log.debug(">>>> Proceed with or drop update algorithm: OK - 2.2.2) ");
			               					removeFromComputationStack(receivedUpdateToken);
			               					//$log.debug(">>>> Proceed with or drop update algorithm: OK - 2.2) ");
			               					
		               					} else if ($scope.orderLinesComputationsStack[0] < receivedUpdateToken) {
				               				// 2.2) If the received update token does not equal the most recent token and is younger
		               					    //TODO: end user notification ?
				               				// => unexpected: drop and notify the user of possible data inconsistency (computationStack missing token!)
				    	       				var message = "Le calcul du montant de commande peut comporter des incohérences. Veuillez vérifier et informer l'administrateur de l'application.";
				    						hbAlertMessages.addAlert("danger",message);
			               					$log.warn(">>>> Proceed with or drop update algorithm: !! - 2.2) ");
		               					}
		               				// 3) If there is no pending update
		               				// => drop (regular situation) (debug log)
		               				} else {
		               					//$log.debug(">>>> Proceed with or drop update algorithm: OK - 3) ");
		               				}
		    	       			}, 
		    	       			function(response) { 
		    	       				$log.debug("Error in computeOrderLines POST operation with status code", response.status);
		    	       				var message = "Le calcul du montant de commande a échoué (statut de retour: "+ response.status+ ")";
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
						if (localLineTypeCell.VALUE === $scope.GROSS_AMOUNT_TOTAL && !$scope.hasManualOrderLine) {
							auditedCell.push(localLineTypeCell.VALUE);
							auditedCell.push(localLineAmountCell.VALUE);
						};
						
						// Manual and rounding amount change are input by user and must trigger computation
						if (
								localLineTypeCell.VALUE === $scope.MANUAL_AMOUNT || 
								localLineTypeCell.VALUE === $scope.ROUNDING_AMOUNT) {
							
							auditedCell.push(localLineTypeCell.VALUE);
							auditedCell.push(localLineAmountCell.VALUE);							
						};
						
						// Rate parameter cell value change is input by user and must trigger computation
						if (
								localLineTypeCell.VALUE === $scope.REDUCTION_RATE ||
								localLineTypeCell.VALUE === $scope.DISCOUNT_RATE ||
								localLineTypeCell.VALUE === $scope.VAT_RATE) {
							
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
						            "VALUE" : "MANUAL_AMOUNT"
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
					//GeoxmlService.addRow($scope.ngModelCtrl.$modelValue, "CARACTERISTIQUE.FRACTION.L", L);
					hbUtil.addFractionLByIndex($scope.ngModelCtrl.$modelValue,index,L);
					$scope.updateOrderLines(formValid);
       				$scope.elfinForm.$setDirty();
				};
				
				
				/**
				 * Removes a `manual entry` order line
				 */
				$scope.removeLine = function (index, formValid) {
					hbUtil.removeFractionLByIndex($scope.ngModelCtrl.$modelValue,index);
					$scope.updateOrderLines(formValid);
				};

			} ]); // End of HbOrderSpreadsheetController definition
        
})();
