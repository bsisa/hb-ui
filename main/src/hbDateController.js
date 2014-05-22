(function() {

	
	angular.module('hb5').controller(
			'HbDateController',
			[
					'$scope',
					'$log',
					'hbUtil',
					function($scope, $log, hbUtil) {

						$log.debug("    >>>> Using HbDateController");	
	
						// TODO: make use of this 
						$scope.geoXmlDateFormat = "yyyy-mm-dd";
						
						// Quick and dirty test
						var splittedModel = $scope.hbDateModel.split("-");
						$scope.date = new Date(splittedModel[2], splittedModel[1] - 1, splittedModel[0]);
						
						$log.debug("hbDateModel is : " + $scope.hbDateModel + ", date is : " + $scope.date);
						
						// Update hbDateModel on date change
						$scope.$watch('date', function (newDate, oldDate) {
							$scope.hbDateModel = ($scope.date.getFullYear() + '-' + $scope.date.getMonth() + 1) + '-' + $scope.date.getDate();
							$log.debug("hbDateModel updated to : " + $scope.hbDateModel + ", date is : " + $scope.date);
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
