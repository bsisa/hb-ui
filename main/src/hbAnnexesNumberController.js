(function() {

	angular
			.module('hb5')
			.controller(
					'HbAnnexesNumberController',
					[
							'$scope',
							'$log',
							'HB_EVENTS',
							'hbUtil',
							function($scope, $log, HB_EVENTS, hbUtil) {
					        	
					            $scope.refresh = function() {
					            	$scope.annexesNoPhoto = hbUtil.getAnnexesExcludingTag($scope.elfin, 'photo');
					            };
					            
					            $scope.$watch('elfin.ANNEXE.RENVOI', function() { 
					            	$scope.refresh();
					            }, true);
					            
					            $scope.refresh();
								 
							} ]);

})();
