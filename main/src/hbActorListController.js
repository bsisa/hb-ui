(function() {

    angular.module('hb5').controller('HbActorListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("    >>>> HbActorListController called... " );

    	// Default order is by "Building management" 
    	$scope.predicate = 'IDENTIFIANT.OBJECTIF';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria 
    	$scope.search = {
    			"text" : ""
    	};    	
    	
        $scope.$watch('elfins', function(newElfins, oldElfins) {
        	if (newElfins) {
        		// Note: underscore syntax is provided by underscore.js library.
        		var uniqueRoles = _.chain($scope.elfins).pluck('IDENTIFIANT').pluck('QUALITE').unique().value(); 
        		$scope.isCollaboratorOnly = (uniqueRoles.length == 1 && uniqueRoles[0] == 'Collaborateur');
        		$scope.isConciergeOnly = (uniqueRoles.length == 1 && uniqueRoles[0] == 'Concierge');
        		$scope.isEntrepriseOnly = (uniqueRoles.length == 1 && uniqueRoles[0] == 'Entreprise');
        		$scope.isRespChauffageOnly = (uniqueRoles.length == 1 && uniqueRoles[0] == 'Responsable chauffage');
        		$scope.isManagerOnly = (uniqueRoles.length == 1 && uniqueRoles[0] == 'Gérant');
        		$scope.isMany = (uniqueRoles.length > 1 || uniqueRoles.length < 1);
        	}
        });
        
    }]);


})();

