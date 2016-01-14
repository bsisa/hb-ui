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

				$log.debug(">>>> HbOrderSpreadsheetController...");
				
				
				
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
				
				
				
				$scope.addRow = function (elfin, path, value) {
					$log.debug(">>>> addRow DOES NOTHING AT THE MOMENT... ");
				};
				
				$scope.removeLine = function (index) {
					$log.debug(">>>> removeLine DOES NOTHING AT THE MOMENT... ");
					$scope.updateOrderLines();
				};

					} ]); // End of HbOrderSpreadsheetController definition
        
})();
