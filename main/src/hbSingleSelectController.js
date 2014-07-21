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
						
						$scope.selectOption = function(option) {
							// Reflect user selection to model.
							$scope.ngModelCtrl.$viewValue = option.name;
							$scope.ngModelCtrl.$commitViewValue();
						};

						
						// Listen to ngModelCtrl model value change. (reference to method is safe thanks angular.noop)
						$scope.$watch('ngModelCtrl.$modelValue', function (newValue, oldValue) {
							$scope.ngModelCtrl.$viewValue = $scope.ngModelCtrl.$modelValue;
						}, true);										
	
					} ]);
	


        
})();
