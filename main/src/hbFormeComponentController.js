(function() {

	angular.module('hb5').controller('HbFormeComponentController',
			[ '$scope', '$log', function($scope, $log) {

				// $log.debug(" >>>> Using HbFormeComponentController");

				// Manage geographic or schematic mode.
				$scope.COORDINATE_TYPE = {
					GEOGRAPHIC : {
						label : "Géographique",
						css : "panel-primary"
					},
					SCHEMATIC : {
						label : "Schématique",
						css : "panel-success"
					}
				};
				$scope.coordinateType = $scope.COORDINATE_TYPE.GEOGRAPHIC;

			} ]);

})();
