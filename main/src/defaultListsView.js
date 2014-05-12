(function() {

    angular.module('hb5').controller('DefaultListsController', ['$scope', 'GeoxmlService', '$routeParams', function($scope, GeoxmlService, $routeParams) {
    
    	console.log("DefaultListsController called...");
    	
    	// Collection id parameter obtained from hb5.config $routeProvider
        $scope.collectionId = $routeParams.collectionId;
        // Contains a JSON Array of ELFINs resulting of the GeoxmlService query   
        $scope.elfins = null;
        $scope.elfinsCount = null;
        // Displays error message feedback to the end user if not empty
        $scope.errorMessage = null;
        
        if (GeoxmlService.validateId($scope.collectionId)) {
            GeoxmlService.getCollection($scope.collectionId).getList()
                .then(function(elfins) {
                	if (elfins == null) {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = 0;
                	} else {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = elfins.length;
                	}
                }, function(response) {
                    $scope.errorMessage = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
                });
        } else {
            $scope.errorMessage = "L'identifiants de collection (" + $scope.collectionId + " ) n'est pas correct.";
        }
    }]);


})();

