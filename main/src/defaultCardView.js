(function() {

    var UploadFileCtrl = function ($scope, $modalInstance, $$renvoi) {

        $scope.$$renvoi = $$renvoi;

        $scope.ok = function () {
            $modalInstance.close();
        };
    };
    

    var DeleteConfirmCtrl = function ($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };        
        
    };    
        
    // TODO: solve $alert requires ngStrap and conflicts on $modal with localytics.directives
    //angular.module('hb5').controller('UploadController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', '$alert', function($scope, GeoxmlService, $modal, $routeParams, $alert) {
    angular.module('hb5').controller('DefaultCardController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', '$location', function($scope, GeoxmlService, $modal, $routeParams, $location) {
    
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        $scope.elfin = null;
        // TODO: once ngStrap can be used both error/status could be replaced by $alert usage.
        $scope.errorMessage = null;
        $scope.statusMessage = null;

        $scope.putElfin = function (elfin) {
       		elfin.put().then( 
       			function() { 
       				console.log("All ok");
       				$scope.statusMessage = "Mise à jour effectuée avec succès.";
       			}, 
       			function(response) { 
       				console.log("Error with status code", response.status);
       			} 
       		);
        };
        
        $scope.delElfin = function (elfin) {
        	
        	var modalInstance = $modal.open({
                templateUrl: 'deleteConfirmModalPanel.html',
                controller: DeleteConfirmCtrl,
                scope: $scope,
                backdrop: 'static'
            });

            modalInstance.result.then(function () {
            	console.log('Modal accepted deletion of elfin: ' + elfin.CLASSE + " - " + elfin.ID_G + "/" + elfin.Id);
   				$scope.statusMessage = "Suppression ACCEPTEE: PAS ENCORE implementée!!!";
   				$location.path('/');
//            	elfin.remove().then( 
//               			function() { 
//               				console.log("All ok");
//               				$scope.statusMessage = "Suppression effectuée avec succès.";
//               				// TODO: redirect to home page ?
//               			}, 
//               			function(response) { 
//               				console.log("Error: card delete failure with status code", response.status);
//               				$scope.errorMessage = "La suppression a échoué. Veuillez s.v.p. recommencer. Si le problème persiste contactez votre administrateur système.";
//               			} 
//               		);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
   				$scope.statusMessage = "Suppression ANNULEE...";
            });        	
        };        
        
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
        };

        $scope.uploadFile = function (renvoi) {

        	var modalInstance = $modal.open({
                templateUrl: 'defaultUploadFileModalPanel.html',
                controller: UploadFileCtrl,
                resolve: {
                    $$renvoi: renvoi
                },
                backdrop: 'static'
            });
        	//TODO: check this is effectively dealing with upload and not configuration selection (see menu.js)
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