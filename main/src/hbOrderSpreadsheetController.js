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

				$log.debug(">>>> HbOrderSpreadsheetController...");				
				
				$scope.MANUAL_AMOUNT = "MANUAL_AMOUNT";
				$scope.GROSS_AMOUNT_TOTAL = "TOTAL_GROSS";
				$scope.REDUCTION_RATE = "REDUCTION_RATE";
				$scope.DISCOUNT_RATE = "DISCOUNT_RATE";
				$scope.ROUNDING_AMOUNT = "ROUNDING_AMOUNT";
				$scope.VAT_RATE = "VAT_RATE";
				$scope.NET_AMOUNT_TOTAL = "TOTAL_NET";
				
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
				 * Listener defining and updating $scope.hasManualOrderLine boolean value
				 */
				$scope.$watch('ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L', function() {
										
					if ($scope.ngModelCtrl !== null && $scope.ngModelCtrl.$modelValue !== null && $scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L) {
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
						
						$scope.updateOrderLines($scope.elfinForm.$valid);
					} else { 
						// Nada
					};
				}, true);				
				
				
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
					
					if (formValid) {
						var restGeoxml = GeoxmlService.getService();				
						
		        		restGeoxml.all("orders/compute/order-lines").post($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE).then( 
		               			function(updatedCaracteristique) {
		               				//$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE = updatedCaracteristique;
		               				diffUpdate($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE, updatedCaracteristique);
		               				// Notify view of model update.
		               				$scope.ngModelCtrl.$render();		               				
		               				$scope.elfinForm.$setDirty();
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
				 * Update localCar by reference for computed values different from newCar
				 */
				var ORDER_LINE_TYPE_POS = 1;
				var ORDER_LINE_PARAM_POS = 3;
				var ORDER_LINE_AMOUNT_POS = 5;
				
				var diffUpdate = function (localCar, newCar) {
					
					for (var i = 0; i < localCar.FRACTION.L.length; i++) {
						var currentLine = localCar.FRACTION.L[i];
						var localLineTypeCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_TYPE_POS);
						var localLineParamCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_PARAM_POS);
						var localLineAmountCell = hbUtil.getCByPos(currentLine.C, ORDER_LINE_AMOUNT_POS);
						
						var newLine = newCar.FRACTION.L[i];
						var newLineTypeCell = hbUtil.getCByPos(newLine.C, ORDER_LINE_TYPE_POS);
						var newLineParamCell = hbUtil.getCByPos(newLine.C, ORDER_LINE_PARAM_POS);
						var newLineAmountCell = hbUtil.getCByPos(newLine.C, ORDER_LINE_AMOUNT_POS);						
						
						// Gross amount is only computed if there is at least one manual order line
						if (
								localLineTypeCell.VALUE === $scope.GROSS_AMOUNT_TOTAL && $scope.hasManualOrderLine ||
								localLineTypeCell.VALUE === $scope.REDUCTION_RATE ||
								localLineTypeCell.VALUE === $scope.DISCOUNT_RATE ||
								localLineTypeCell.VALUE === $scope.VAT_RATE ||
								localLineTypeCell.VALUE === $scope.NET_AMOUNT_TOTAL 
						) {
							localLineAmountCell.VALUE = newLineAmountCell.VALUE;
						}
						
					}
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
