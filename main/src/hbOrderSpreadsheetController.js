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
				};

					} ]); // End of HbOrderSpreadsheetController definition
        
})();
