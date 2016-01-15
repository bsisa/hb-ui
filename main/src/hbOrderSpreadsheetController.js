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
				
				$scope.GROSS_AMOUNT_TOTAL = "TOTAL_GROSS";
				$scope.MANUAL_AMOUNT = "MANUAL_AMOUNT";
				
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
				$scope.$watch('ngModelCtrl.$modelValue', function() {
					
					if ($scope.ngModelCtrl !== null && $scope.ngModelCtrl.$modelValue !== null) {
						$log.debug(">>>> $modelValue CHANGED...");
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
				 * Listener defining and updating $scope.hasManualOrderLine boolean value
				 */
				$scope.$watch('ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L', function() {
										
					if ($scope.ngModelCtrl !== null && $scope.ngModelCtrl.$modelValue !== null && $scope.ngModelCtrl.$modelValue.CARACTERISTIQUE.FRACTION.L) {
						$log.debug(">>>> $modelValue.CARACTERISTIQUE.FRACTION.L CHANGED...");
					} else { 
						// Nada
					};
				}, true);				
				
				
				/**
				 * Boolean expression to make order line value conditionally editable
				 */
				$scope.lineValueEditable = function(line) {
					return (line.C[0].VALUE === $scope.MANUAL_AMOUNT) || ((line.C[0].VALUE === $scope.GROSS_AMOUNT_TOTAL) && !$scope.hasManualOrderLine )
				};
				
				
				/**
				 * Call HB-API service to obtain order lines computation.
				 */
				$scope.updateOrderLines = function(formValid) {
					
					if (formValid) {
						var restGeoxml = GeoxmlService.getService();				
						
		        		restGeoxml.all("orders/compute/order-lines").post($scope.ngModelCtrl.$modelValue.CARACTERISTIQUE).then( 
		               			function(updatedCaracteristique) {
		               				$scope.ngModelCtrl.$modelValue.CARACTERISTIQUE = updatedCaracteristique;
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
			

				//$scope.lineOrderTypeChoices = hbUtil.buildArrayFromCatalogueDefault("%|val|sum");				
				
				
				/**
				 * Adds a `manual entry` order line
				 */
				$scope.addLine = function (index, formValid) {
					$log.debug("addLine("+index+")");
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
