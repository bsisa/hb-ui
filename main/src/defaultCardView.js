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
    angular.module('hb5').controller('DefaultCardController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', '$location', 'sharedMessages', 'hbUtil', function($scope, GeoxmlService, $modal, $routeParams, $location, sharedMessages, hbUtil) {
    
    	$scope.$watch('elfin', function() { 
    		// TODO: show a notification ... data need save...
    		console.log("elfin watch...")
    	}, true);
    	
//    	$scope.$watchCollection('elfin.IDENTIFIANT.MOTCLE', function() { 
//    		// TODO: show a notification ... data need save...
//    		console.log("elfin.IDENTIFIANT.MOTCLE watch...")
//    	});    	
    	
    	// Parameters extracted from the URL and identifying the ELFIN to be edited  
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        
        // The ELFIN to be edited once obtained from REST API.
        $scope.elfin = null;
        $scope.motcles = null; // angularjs array of primitive fix.
        
        // TODO: once ngStrap can be used both error/status could be replaced by $alert usage.
        // Local messages
        $scope.errorMessage = null;
        $scope.statusMessage = null;
        // Shared messages (between controllers).
    	$scope.setSharedStatusMessage = sharedMessages.setStatusMessage;
        
    	// Wrapper for ELFIN PUT (update) operation
        $scope.putElfin = function (elfin) {
        	var updatedMotcle = [];
        	
        	for (var i = 0, l = $scope.motcles.length; i < l; ++i) {
                //div.innerHTML += input[i] + "<br />";
        		updatedMotcle.push($scope.motcles[i].VALUE);
            }        	

        	elfin.IDENTIFIANT.MOTCLE = updatedMotcle;
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
        
    	// Wrapper for ELFIN DELETE operation
        $scope.delElfin = function (elfin) {
        	
        	var modalInstance = $modal.open({
                templateUrl: 'deleteConfirmModalPanel.html',
                controller: DeleteConfirmCtrl,
                scope: $scope,
                backdrop: 'static'
            });

            modalInstance.result.then(function () {
            	elfin.remove().then( 
               			function() { 
                        	var message = "Suppression de l'object " + elfin.CLASSE + " - " + elfin.ID_G + "/" + elfin.Id + " effectuée avec succès.";
                        	// Set shared status message for use in next controller where redirection happens. 
               				$scope.setSharedStatusMessage(message);
               				$location.path('/');
               			}, 
               			function(response) { 
               				var message = "La suppression a échoué. Veuillez s.v.p. recommencer. Si le problème persiste contactez votre administrateur système et lui communiquer le message suivant: " + response.status;
               				// Set local error message
               				$scope.errorMessage = message;
               				// Reset local status
               				$scope.statusMessage = null;
               				console.log("Error: ELFIN delete failure with status code", response.status);
               			} 
               		);
            }, function () {
            	var message = "Suppression de l'object " + elfin.CLASSE + " - " + elfin.ID_G + "/" + elfin.Id + " annulée.";
                // Local message
   				$scope.statusMessage = message;
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
                	// Force CAR array sorting by POS attribute
                	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
                	hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
                    $scope.elfin = elfin;
                    
                    console.log("elfin.IDENTIFIANT.MOTCLE type: " + typeof elfin.IDENTIFIANT.MOTCLE);
                    console.log("elfin.IDENTIFIANT.MOTCLE length: " + elfin.IDENTIFIANT.MOTCLE.length);
                    var motcleArray = []
                    for (var i = 0, l = elfin.IDENTIFIANT.MOTCLE.length; i < l; ++i) {
                        //div.innerHTML += input[i] + "<br />";
                        motcleArray.push({POS: i , VALUE: elfin.IDENTIFIANT.MOTCLE[i] });
                    }
//                    for ( motcle in elfin.IDENTIFIANT.MOTCLE) {
//                    	
//                    }
                    
                    $scope.motcles = motcleArray;
                }, function(response) {
                    $scope.errorMessage = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
                });
            } else {
            $scope.errorMessage = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
        }
    }]);


})();