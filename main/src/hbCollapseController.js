(function() {

    angular.module('hb5').controller('HbCollapseController', ['$scope', '$log', function($scope, $log) {

    	$scope.isCollapsed = null;
    	
    	if ($scope.initCollapsed && $scope.initCollapsed === true) {
    		$scope.isCollapsed = true;
    	} else {
    		$scope.isCollapsed = false;	
    	}
    	
    }]);

})();

