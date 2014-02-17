(function() {

    var UploadFileCtrl = function ($scope, $modalInstance, $$renvoi) {

        $scope.$$renvoi = $$renvoi;

        $scope.ok = function () {
            $modalInstance.close();
        };


    };

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
        };

        $scope.typeTypes = {
            GEOGRAPHIE: "Géographie",
            SCHEMATIQUE: "Schématique"
        };

        $scope.dimensionNames = {
            LONGUEUR: "Longueur",
            SURFACE: "Surface",
            RAYON: "Rayon"
        };

        $scope.formFunctions = {
            LIBRE: "Libre",
            LIE: "Lié",
            BASE: "Base"
        };

        $scope.lineDirections = {
            AVAL: "Aval",
            AMONT: "Amont"
        };

        $scope.lineFunctions = {
            FRONTIERE: "Frontière",
            AXE: "Axe"
        };

        $scope.addRow = function(elfin, path, rowObject) {
            GeoxmlService.addRow(elfin, path, rowObject);
        }

        $scope.uploadFile = function (renvoi) {

            var modalInstance = $modal.open({
                templateUrl: 'defaultUploadFile.html',
                controller: UploadFileCtrl,
                resolve: {
                    $$renvoi: renvoi
                },
                backdrop: 'static'
            });

            modalInstance.result.then(function (selection) {
                $scope.$$activeConfiguration = selection;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };


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