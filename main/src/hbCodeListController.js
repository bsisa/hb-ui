(function() {

    angular.module('hb5').controller('HbCodeListController', ['$attrs', '$scope', 'GeoxmlService', '$routeParams', '$log', 'hbAlertMessages', 'hbUtil', function($attrs, $scope, GeoxmlService, $routeParams, $log, hbAlertMessages, hbUtil) {
    
    	// Default order is by "code" which is store in NOM field. 
    	$scope.predicate = 'IDENTIFIANT.NOM';
    	$scope.reverse = false;

    	// Object holding user entered search (filter) criteria 
    	$scope.search = {
    			"text" : ""
    	};    	
    	
//        $scope.$watch('elfins', function(newElfins, oldElfins) {
//        	if (newElfins) {
        		// Note: underscore syntax is provided by underscore.js library.
//        		var uniqueGroups = _.chain($scope.elfins).pluck('IDENTIFIANT').pluck('QUALITE').unique().value(); 
//        		$scope.isCollaboratorOnly = (uniqueGroups.length == 1 && uniqueGroups[0] == 'Collaborateur');
//        		$scope.isConciergeOnly = (uniqueGroups.length == 1 && uniqueGroups[0] == 'Concierge');
//        		$scope.isEntrepriseOnly = (uniqueGroups.length == 1 && uniqueGroups[0] == 'Entreprise');
//        		$scope.isRespChauffageOnly = (uniqueGroups.length == 1 && uniqueGroups[0] == 'Responsable chauffage');
//        		$scope.isManagerOnly = (uniqueGroups.length == 1 && uniqueGroups[0] == 'Gérant');
//        		$scope.isMany = (uniqueGroups.length > 1 || uniqueGroups.length < 1);
//        	}
//        });
        
    }]);


})();

