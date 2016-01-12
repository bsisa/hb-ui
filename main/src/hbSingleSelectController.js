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
						 * Get option.name for option.value provided as optionValue parameter
						 * 
						 * Returns option.name from options. 
						 * If not found checks for emptyOption.value match. 
						 * If it does not match emptyOption either returns undefined.
						 */
						$scope.getOptionName = function(value) {
							var optionRes = _.find($scope.options, function(option){ return (option.value === value); });
							if (optionRes) {
								if (optionRes.name) {
									return optionRes.name;	
								} else {
									return undefined;
								}
								
							} else if ($scope.emptyOption && ($scope.emptyOption.value === value)) {
								return $scope.emptyOption.name;
							} else {
								return undefined;
							}
						};
						
						/**
						 * Reflects user selection to model view value and simulate user input with commit action.
						 */
						$scope.selectOption = function(option) {
							// Reflect user selection to model.
							$scope.ngModelCtrl.$setViewValue(option.value);
							$scope.ngModelCtrl.$render();													
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
