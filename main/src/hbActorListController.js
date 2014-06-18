(function() {

    angular.module('hb5').controller('HbActorListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbActorListController called...");
    	
    	if ($routeParams.xpath) {
    		$log.debug("    >>>> HbActorListController - XPATH parameter found:  " + $routeParams.xpath);
   		
    		$scope.isCollaboratorOnly = ($routeParams.xpath === "//ELFIN[IDENTIFIANT/QUALITE='Collaborateur']") || ($routeParams.xpath === "//ELFIN[@CLASSE='ACTOR' and IDENTIFIANT/QUALITE='Collaborateur']");
    	} else {
    		$log.debug("    >>>> HbActorListController - NO XPATH parameter found...");
    		$scope.isCollaboratorOnly = false;
    	}
        
    }]);


})();

