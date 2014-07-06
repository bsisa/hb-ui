(function() {

    angular.module('hb5').controller('HbConstatListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbConstatListController called... " );

    	// Default order is by "Groupe" 
    	$scope.predicate = 'GROUPE';
    	$scope.reverse = false;
        
    }]);


})();

