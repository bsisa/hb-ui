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
					function($attrs, $scope, $modal, $routeParams,
							$location, $log, $timeout, hbAlertMessages, hbUtil, GeoxmlService, hbQueryService) {

				$scope.GROSS_AMOUNT_TOTAL = "TOTAL_GROSS";
				$scope.MANUAL_AMOUNT = "MANUAL_AMOUNT";
				
				$log.debug(">>>> HbOrderSpreadsheetController...");

				/**
				 * Listener defining and updating $scope.hasManualOrderLine boolean value
				 */
				$scope.$watch('ngModelCtrl.$modelValue', function() {
					
					if ($scope.ngModelCtrl !== null && $scope.ngModelCtrl.$modelValue !== null) {
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
				 * Boolean expression to make order line value conditionally editable
				 */
				$scope.lineValueEditable = function(line) {
					return (line.C[0].VALUE === $scope.MANUAL_AMOUNT) || ((line.C[0].VALUE === $scope.GROSS_AMOUNT_TOTAL) && !$scope.hasManualOrderLine )
				};
				
				
				/**
				 * Call HB-API service to obtain order lines computation.
				 */
				$scope.updateOrderLines = function() {
					
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

				$scope.lineOrderTypeChoices = hbUtil.buildArrayFromCatalogueDefault("%|val|sum");				
				
				
				
				$scope.addLine = function (index) {
					$log.debug("addLine("+index+")");
					var L = {
						          "C" : [ {
						            "POS" : 1,
						            "VALUE" : "MANUAL_AMOUNT"
						          }, {
						            "POS" : 2,
						            "VALUE" : "Lavabo"
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
					// Notify view of model update.
       				$scope.ngModelCtrl.$render();
       				$scope.elfinForm.$setDirty();
					
				};
				
				$scope.removeLine = function (index) {
					$log.debug(">>>> removeLine TODO: implement... ");
					hbUtil.removeFractionLByIndex($scope.ngModelCtrl.$modelValue,index);
					$scope.updateOrderLines();
				};

					} ]); // End of HbOrderSpreadsheetController definition
        
})();
