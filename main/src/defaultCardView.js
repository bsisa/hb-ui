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
    
    	// Parameters extracted from the URL and identifying the ELFIN to be edited  
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        
        // The ELFIN to be edited once obtained from REST API.
        $scope.elfin = null;
        $scope.constats = null;
        
        // TODO: once ngStrap can be used both error/status could be replaced by $alert usage.
        // Local messages
        $scope.errorMessage = null;
        $scope.statusMessage = null;
        // Shared messages (between controllers).
    	$scope.setSharedStatusMessage = sharedMessages.setStatusMessage;    	
    	
    	// Watch related to CONSTAT list 
    	$scope.$watch('elfin.IDENTIFIANT.NOM', function() { 
    		if (elfin!=null) {
	    		console.log("elfin.IDENTIFIANT.NOM watch for CONSTAT");
	            var xpathForConstats = "//ELFIN[IDENTIFIANT/COMPTE='"+$scope.elfin.IDENTIFIANT.NOM+"']";
	            // TODO: constatsCollectionId must come from server configuration resource.
	            var constatsCollectionId = 'G20060920171100001';
	            GeoxmlService.getCollection(constatsCollectionId).getList({"xpath" : xpathForConstats})
					.then(function(elfins) {
						console.log(">>>> received " + elfins.length + " elfins.");
							$scope.constats = elfins;
						},
						function(response) {
							$scope.errorMessage = "Le chargement des CONSTATs a échoué (statut de retour: "+ response.status+ ")";
						});
    		}
    	}, true);
    	
    	$scope.removeKeyword = function ( index ) {
    		console.log("removing MOCLE at index " + index);
    	    $scope.elfin.IDENTIFIANT.MOTCLE.splice(index,1);
    	};
    	
    	// Wrapper for ELFIN PUT (update) operation
        $scope.putElfin = function (elfin) {
       		elfin.put().then( 
       			function() { 
       				console.log("All ok");
       				// Consider good practice to reload the actual db  
       				// content unless server load is a concern.
       				$scope.getElfin($scope.collectionId,$scope.elfinId);
       				$scope.elfinForm.$setPristine();
       				// Message feedback is removed in favour of dirty/pristine CSS 
       				//$scope.statusMessage = "Mise à jour effectuée avec succès.";
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

        
        $scope.getElfin = function (collectionId, elfinId) {
        	if (GeoxmlService.validateId(collectionId) && GeoxmlService.validateId(elfinId)) {
		        GeoxmlService.getElfin(collectionId, elfinId).get()
		        .then(function(elfin) {
		        	// Force CAR array sorting by POS attribute
		        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
		        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
		        	//       Need review of other similar operations
		        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
		        		console.log("Found CARSET/CAR...");
		        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
		        	} else {
		        		console.log("No CARSET/CAR...");
		        	}
		            $scope.elfin = elfin;
		        }, function(response) {
		            $scope.errorMessage = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
		        });
            }
            else {
                $scope.errorMessage = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";        
            };	        
        };

        $scope.getElfin($scope.collectionId,$scope.elfinId);
        
    }]);


})();