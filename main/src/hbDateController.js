(function() {

	angular.module('hb5').controller(
			'HbDateController',
			[
					'$scope',
					'$log',
					'$filter',
					'hbUtil',
					function($scope, $log, $filter, hbUtil) {

						// Initialisation
						$scope.hbDateCtrl = null;

						this.$setHbDateCtrl = function(ctrl) {
							$log.debug("    >>>> $setHbDateCtrl <<<< ");
							$scope.hbDateCtrl = ctrl;
							// Specify how UI should be updated
							$scope.hbDateCtrl.$viewChangeListeners.push( function() {
								$log.debug("$viewChangeListeners called for hbDateCtrl: ");
								$log.debug("hbDateCtrl.$modelValue = " + $scope.hbDateCtrl.$modelValue);
								$log.debug("hbDateCtrl.$viewValue = " + $scope.hbDateCtrl.$viewValue);
					        });
							$scope.hbDateCtrl.$render( function() {
								$log.debug("$render called for hbDateCtrl: ");
								$log.debug("hbDateCtrl.$modelValue = " + $scope.hbDateCtrl.$modelValue);
								$log.debug("hbDateCtrl.$viewValue = " + $scope.hbDateCtrl.$viewValue);
					        });							
						};
						
						$log.debug("    >>>> Using HbDateController");	
	
						// TODO: make use of this 
						var GEOXML_DATE_FORMAT = "yyyy-MM-dd";
						
						// Quick and dirty test
//						var splittedModel = $scope.$modelValue.split("-");
//						$scope.date = new Date(splittedModel[2], splittedModel[1] - 1, splittedModel[0]);
						$scope.date = null;
//						
//						$log.debug("$modelValue is : " + $scope.$modelValue + ", date is : " + $scope.date);
//						
						// Update ngModel on date change
						$scope.$watch('date', function (newDate, oldDate) {
							$log.debug("Date change from " + oldDate + " to " + newDate);
							if (newDate) {
								var isoTextDate = $filter('date')($scope.date, GEOXML_DATE_FORMAT);
								$log.debug("isoTextDate: " + isoTextDate);
								// Simulate user entry...
								$log.debug("Simulate user entry... ");
								$scope.hbDateCtrl.$viewValue = isoTextDate;
								$log.debug("$commitViewValue ... ");
								$scope.hbDateCtrl.$commitViewValue();
//
//								$log.debug("Update the model ... ");
//								$scope.hbDateCtrl.$modelValue = isoTextDate;
							}
							if ($scope.hbDateCtrl) {
								$log.debug("hbDateCtrl.$modelValue = " + $scope.hbDateCtrl.$modelValue);
								$log.debug("hbDateCtrl.$viewValue = " + $scope.hbDateCtrl.$viewValue);
							}							
//							$scope.$modelValue = ($scope.date.getFullYear() + '-' + $scope.date.getMonth() + 1) + '-' + $scope.date.getDate();
//							$log.debug("$modelValue updated to : " + $scope.$modelValue + ", date is : " + $scope.date);
						}, true);
 
						// Listen to hbDateCtrl model value change. (reference to method is safe thanks angular.noop)
						$scope.$watch('hbDateCtrl.$modelValue', function (newValue, oldValue) {
							
							$log.debug("hbDateCtrl.$modelValue changed : " + oldValue + " => " + newValue);
							
							if ($scope.hbDateCtrl) {
								// update datepicker date with hbDate
								var milliseconds = Date.parse($scope.hbDateCtrl.$modelValue);
					            if (!isNaN(milliseconds)) {
					            	$scope.date = new Date(milliseconds);
					            } else {
					            	if ($scope.myWidget) {
					            		$log.debug("Found myWidget setting it to invalid...");
					            		var validationErrorKey = "hbDateInvalid";
					            		var isValid = false;
					            		$scope.myWidget.$setValidity(validationErrorKey, isValid);
					            	} else {
					            		$log.debug("Could not find myWidget in scope");
					            	}
					            }
							}							
						}, true);						
						
						
						// TODO: should be automatic with $locale providing the correct id i.e.: fr-ch, de-ch,...
						$scope.dateFormat = 'dd.MM.yyyy';						
						
						// Only valid with ui.bootstrap 0.11.0 not 0.10.0						
//						$scope.fromDateOpened = false;
//						$scope.open = function($event) {
//						    $event.preventDefault();
//						    $event.stopPropagation();
//						    if ($scope.fromDateOpened) {
//						    	$log.debug("    >>>>  OPEN -> CLOSE  <<<<");
//						    	$scope.fromDateOpened = false;
//						    } else {
//						    	$log.debug("    >>>>  CLOSE -> OPEN  <<<<");
//						    	$scope.fromDateOpened = true;	
//						    }
//						  };
						// ============================================
						// TODO: move to hbDate directive - END
						// ============================================
	
					} ]);
	


        
})();
