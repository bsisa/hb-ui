(function() {

	angular.module('hb5').controller(
			'HbDateController',
			[
					'$scope',
					'$log',
					'$filter',
					'hbUtil',
					function($scope, $log, $filter, hbUtil) {

						$log.debug("    >>>> Using HbDateController");
						
						$scope.dateCss = '';
						
						// TODO: should be automatic with $locale providing the correct id i.e.: fr-ch, de-ch,...
						// UI date format
						$scope.dateFormat = 'dd.MM.yyyy';												
						// TODO: make use of this
						// GeoXML date format (ISO)
						var GEOXML_DATE_FORMAT = "yyyy-MM-dd";						

						// Reference to hb-date ng-model sibling directive controller
						$scope.hbDateNgModelCtrl = null;

						this.setHbDateNgModelCtrl = function(ctrl) {
							$log.debug("hbDate.setHbDateNgModelCtrl ...");
							$scope.hbDateNgModelCtrl = ctrl;						
						};
						
						// datepicker-popup ng-model date
						$scope.date = null;
						
						
						// Update ngModel on user date change
						$scope.$watch('date', function (newDate, oldDate) {

							$log.debug("Date change from " + oldDate + " to " + newDate);
							
							if (newDate && (newDate !== null)) {
								// Convert $scope.date to GeoXML string format suitable for hbDateNgModelCtrl
								var isoTextDate = $filter('date')($scope.date, GEOXML_DATE_FORMAT);
							
								//$log.debug(">>>> isoTextDate: " + isoTextDate);
								
								if (isoTextDate !== $scope.hbDateNgModelCtrl.$modelValue) {
									// Simulate user entry...
									$scope.hbDateNgModelCtrl.$setViewValue(isoTextDate);
									$scope.hbDateNgModelCtrl.$render();									
								} else {
									//$log.debug(">>>> ALREADY IN SYNC: $date and hbDateNgModelCtrl.$modelValue ");
								}
							} else {
								// Allow user to reset an existing date value to null.
								if (oldDate != newDate) {
									//$log.debug(">>>> oldDate changed to newDate NULL... let's update the model...");
									// Simulate user entry...
									$scope.hbDateNgModelCtrl.$setViewValue(null);
									$scope.hbDateNgModelCtrl.$render();
								} else {
									//$log.debug(">>>> oldDate === newDate and is NULL... do nothing...");
								}
							}
						}, true);
 

						// Listen to hbDateNgModelCtrl model value change. (reference to method is safe thanks angular.noop)
						$scope.$watch('hbDateNgModelCtrl.$modelValue', function (newValue, oldValue) {
							
							$log.debug("hbDateNgModelCtrl.$modelValue changed : " + oldValue + " => " + newValue);
							
							// Fix not updating to model value date in some situation where initialisation to model value 
							// did not occur yet due to asynchronous intialisation, by removing:
							// "update optimisation condition" && (newValue !== oldValue)
							if ($scope.hbDateNgModelCtrl && (newValue !== null)) {
								// update datepicker date with hbDate
								var milliseconds = Date.parse($scope.hbDateNgModelCtrl.$modelValue);
					            if (!isNaN(milliseconds)) {
					            	$scope.date = new Date(milliseconds);
					            	//$log.debug(">>>> New $scope.hbDateNgModelCtrl.$modelValue assigned to $scope.date : " + $scope.date);
					            } else {
					            	//$log.debug(">>>> NaN for $scope.hbDateNgModelCtrl.$modelValue : " + $scope.hbDateNgModelCtrl.$modelValue);
					            	// TODO: check if this is a good way to trigger date validation error.
					            	// looks a bad idea do nothing
					            	//$scope.date = NaN;
					            }
							} else {
								//$log.debug(">>>> DO NOTHING: hbDateNgModelCtrl.$modelValue new and old are identical.");
							}
						}, true);						
						

						// Only valid/used with ui.bootstrap 0.11.0 not 0.10.0
						$scope.open = function($event) {
						    $event.preventDefault();
						    $event.stopPropagation();

						    $scope.opened = true;
						};
	
					} ]);
	


        
})();
