(function() {

    angular.module('hb5').controller('ActeurCardController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', '$location', 'hbAlertMessages', 'hbUtil', function($scope, GeoxmlService, $modal, $routeParams, $location, hbAlertMessages, hbUtil) {
    
    	console.log("    >>>> Using ActeurCardController (slim)");
    	
        $scope.qualiteList = {
        		"Gérant":"Gérant",
        		"Concierge":"Concierge",
        		"Responsable chauffage":"Responsable chauffage",
        		"Entreprise":"Entreprise",
        		"Collaborateur": "Collaborateur"        		
        }; 	
    	
        
    }]);


})();