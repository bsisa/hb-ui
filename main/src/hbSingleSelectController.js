(function() {

	angular.module('hb5').controller(
			'HbSingleSelectController',
			[
					'$scope',
					'$log',
					'$filter',
					'hbUtil',
					function($scope, $log, $filter, hbUtil) {

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
						 * Reflects user selection to model view value and simulate user input with commit action.
						 */
						$scope.selectOption = function(option) {
							// Reflect user selection to model.
							$scope.ngModelCtrl.$viewValue = option.name;
							$scope.ngModelCtrl.$commitViewValue();
						};

						/**
						 * Listen to ngModelCtrl model value change and reflect it to the view.
						 * Note: Reference to method is safe thanks to angular.noop
						 */
						$scope.$watch('ngModelCtrl.$modelValue', function (newValue, oldValue) {
							$scope.ngModelCtrl.$viewValue = $scope.ngModelCtrl.$modelValue;
						}, true);										
	
					} ]);
	


        
})();
