(function() {

	angular
			.module('hb5')
			.controller(
					'HbAnnexesNumberController',
					[
					        '$rootScope',
							'$scope',
							'$log',
							'$filter',
							'HB_EVENTS',
							function($rootScope, $scope, $log, $filter, HB_EVENTS) {

					            $scope.refresh = function() {
									if (!(angular.isUndefined($scope.elfin) || $scope.elfin===null) && !angular.isUndefined($scope.elfin.ANNEXE) && !angular.isUndefined($scope.elfin.ANNEXE.RENVOI)) {
										$scope.annexesNoPhoto = $filter('annexExcludeTag')($scope.elfin.ANNEXE.RENVOI, 'photo');
									} else {
										$scope.annexesNoPhoto = new Array();
									}
					            };
					            
					            $scope.$watch('elfin.ANNEXE.RENVOI', function() { 
					            	$scope.refresh();
					            }, true);
					            
					            $scope.refresh();
								 
							} ]);

})();
