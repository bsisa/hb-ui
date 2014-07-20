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

								$log.debug("    >>>> HbAnnexesNumberController called... ");

					            $scope.refresh = function() {
									if (!angular.isUndefined($scope.elfin) && !angular.isUndefined($scope.elfin.ANNEXE) && !angular.isUndefined($scope.elfin.ANNEXE.RENVOI)) {
										$scope.annexesNoPhoto = $filter('annexExcludeTag')($scope.elfin.ANNEXE.RENVOI, 'photo');
										$log.debug("    >>>> HbAnnexesNumberController - RENVOI DEFINED = " + $scope.annexesNoPhoto.length);
									} else {
										$log.debug("    >>>> HbAnnexesNumberController - RENVOI NOT DEFINED");
										$scope.annexesNoPhoto = new Array();
									}
					            };
					            
					            $scope.$watch('elfin.ANNEXE.RENVOI', function() { 
					            	$log.debug("    >>>> HbAnnexesNumberController - watching elfin.ANNEXE.RENVOI");
					            	$scope.refresh();
					            }, true);
					            
					            $scope.refresh();
								 
							} ]);

})();
