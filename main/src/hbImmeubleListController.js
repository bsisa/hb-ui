(function() {

    angular.module('hb5').controller('HbImmeubleListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbImmeubleListController called...");
    	
    	// Default order is by "Building management" 
    	$scope.predicate = 'IDENTIFIANT.OBJECTIF';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria 
    	$scope.search = {
    			"owner" : "",
    			"registerNb" : "",
    			"place" : "",
    			"buildingNb" : "",
    			"address" : ""
    	};
    	
    }]);


})();

