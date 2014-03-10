(function() {

    angular.module('hb5').controller('DefaultListsController', ['$scope', 'GeoxmlService', '$routeParams', function($scope, GeoxmlService, $routeParams) {
    
    	console.log("DefaultListsController...");
        $scope.collectionId = $routeParams.collectionId;
        console.log("DefaultListsController... collectionId = " + $scope.collectionId);
        $scope.elfins = null;
        $scope.elfinsCount = null;
        $scope.errorMessage = null;  
        $scope.statusMessage = null;  
        
        if (GeoxmlService.validateId($scope.collectionId)) {
        	console.log("DefaultListsController v0.6 calling get collection...");
            GeoxmlService.getCollection($scope.collectionId).getList()
                .then(function(elfins) {
                	console.log("DefaultListsController elfins promise obtained... ");
                	if (elfins == null) {
                		console.log("DefaultListsController elfins NULLLLL... ");
                		$scope.statusMessage = "Empty list of elfins returned...";
                	} else {
                		$scope.elfins = elfins;
                		$scope.elfinsCount = elfins.length;
                		console.log("DefaultListsController elfins NOT NULL, " + elfins);
                		$scope.statusMessage = elfins.length + " immeubles.";
                	}

                    //console.log("DefaultListsController obtained " + elfins.length + " results.");
                    console.log("DefaultListsController $scope.elfins = elfins; performed... ");
                }, function(response) {
                    $scope.errorMessage = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
                });
        } else {
            $scope.errorMessage = "L'identifiants de collection (" + $scope.collectionId + " ) n'est pas correct.";
        }
    }]);


})();

