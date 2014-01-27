(function() {

    angular.module('hb5').controller('DefaultCardController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', function($scope, GeoxmlService, $modal, $routeParams) {


        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        $scope.elfin = null;
        $scope.errorMessage = null;

        $scope.elfinTypes = {
            BIEN: "Bien",
            ACTIVITE: "Activité",
            PERSONNE: "Personne",
            DOCUMENT: "Document"
        }

        if (GeoxmlService.validateId($scope.collectionId) && GeoxmlService.validateId($scope.elfinId)) {
            GeoxmlService.getElfin($scope.collectionId, $scope.elfinId).get()
                .then(function(elfin) {
                    $scope.elfin = elfin;
                }, function(response) {
                    $scope.errorMessage = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
                });
            } else {
            $scope.errorMessage = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
        }

    }]);


})();