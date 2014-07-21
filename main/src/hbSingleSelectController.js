(function() {

	angular.module('hb5').controller(
			'HbSingleSelectController',
			[
					'$scope',
					'$log',
					'$filter',
					'hbUtil',
					function($scope, $log, $filter, hbUtil) {

						// Reference to hb-single-select ng-model sibling directive controller
						$scope.ngModelCtrl = null;

						this.setNgModelCtrl = function(ctrl) {
							$scope.ngModelCtrl = ctrl;						
						};
						
						$scope.selectedOption = null;

						//$scope.options = null;
						
						$scope.selectOption = function(option) {
							$scope.selectedOption = option;
							// Simulate user entry
							$scope.ngModelCtrl.$viewValue = option.name;
							$scope.ngModelCtrl.$commitViewValue();
						};

	
					} ]);
	


        
})();
