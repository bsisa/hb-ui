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
        
    // TODO: Rename to HbCardContainerController
    angular.module('hb5').controller('HbCardContainerController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', '$location', 'hbAlertMessages', 'hbUtil', function($scope, GeoxmlService, $modal, $routeParams, $location, hbAlertMessages, hbUtil) {
    
    	console.log("HbCardContainerController called at " + new Date());
    	
    	// ====================================================================
    	// Global logic to move to hb-card-container directive controller.
    	// ====================================================================    	
    	
    	// Parameters extracted from the URL and identifying the ELFIN to be edited  
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        
        // The ELFIN to be edited once obtained from REST API.
        $scope.elfin = null;
        
        // TODO: check if listening to model change from controllers can be improved.
        $scope.$watch('elfin', function(newValue, oldValue) {
			// Only change form status if elfin was initialised.
        	if (oldValue) {
				$scope.elfinForm.$setDirty();
				//Reminder: to restore form status to pristine.
				//$scope.elfinForm.$setPristine();
			}
        }, true);
        
    	$scope.removeKeyword = function ( index ) {
    		console.log("removing MOCLE at index " + index);
    	    $scope.elfin.IDENTIFIANT.MOTCLE.splice(index,1);
    	};
    	
    	// Wrapper for ELFIN PUT (update) operation
        $scope.putElfin = function (elfin) {
        	console.log("HbCardContainerController putElfin called at " + new Date());
       		elfin.put().then( 
       			function() { 
       				console.log("All ok");
       				// Consider good practice to reload the actual db  
       				// content unless server load is a concern.
       				$scope.getElfin($scope.collectionId,$scope.elfinId);
       				$scope.elfinForm.$setPristine();
       				// Message feedback is removed in favour of dirty/pristine CSS 
       				//var message = "Mise à jour effectuée avec succès.";
       				//hbAlertMessages.addAlert("success",message);
       			}, 
       			function(response) { 
       				console.log("Error with status code", response.status);
       				var message = "La mise à jour a échoué (statut de retour: "+ response.status+ ")";
					hbAlertMessages.addAlert("danger",message);
       			} 
       		);
        };
        
    	// Wrapper for ELFIN DELETE operation
        $scope.delElfin = function (elfin) {
        	
        	console.log("HbCardContainerController delElfin called at " + new Date());
        	
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
               				hbAlertMessages.addAlert("success",message);
               				$location.path('/');
               			}, 
               			function(response) { 
               				var message = "La suppression a échoué. Veuillez s.v.p. recommencer. Si le problème persiste contactez votre administrateur système et lui communiquer le message suivant: " + response.status;
               				hbAlertMessages.addAlert("danger",message);
               				console.log("Error: ELFIN delete failure with status code", response.status);
               			} 
               		);
            }, function () {
            	var message = "Suppression de l'object " + elfin.CLASSE + " - " + elfin.ID_G + "/" + elfin.Id + " annulée.";
   				hbAlertMessages.addAlert("warning",message);
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
        	
        	console.log("HbCardContainerController getElfin called at " + new Date());
        	
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
		        	var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
		            hbAlertMessages.addAlert("danger",message);
		        });
            }
            else {
                var message = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
                hbAlertMessages.addAlert("warning",message);
            };
        };

        $scope.getElfin($scope.collectionId,$scope.elfinId);
        
    	// ====================================================================
    	// END OF Global logic to move to hb-card-container directive controller.
    	// ====================================================================        
        
    }]);


})();