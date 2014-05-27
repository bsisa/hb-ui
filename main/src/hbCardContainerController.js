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
        
    /**
     * Controller for hb-card-container directive providing the global elfin card toolbox and 
     * insert point (ng-transclude) for custom cards layout. 
     */
    angular.module('hb5').controller('HbCardContainerController', ['$scope', 'GeoxmlService', '$modal', '$routeParams', '$location', '$log', 'hbAlertMessages', 'hbUtil', function($scope, GeoxmlService, $modal, $routeParams, $location, $log, hbAlertMessages, hbUtil) {
    
    	$log.debug("HbCardContainerController called at " + new Date());
    	
    	// ====================================================================
    	// Global logic to move to hb-card-container directive controller.
    	// ====================================================================    	
    	
    	// Parameters extracted from the URL and identifying the ELFIN to be edited  
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        
        // The ELFIN to be edited once obtained from REST API.
        $scope.elfin = null;
        
        // ============================================================
        // Button bar layout helpers
        // ============================================================
        
        // Manage enable/disable state 
        $scope.canSave = function() {
        	return $scope.elfinForm.$dirty && $scope.elfinForm.$valid;
        };
        
        // Manage button class depending on pristine/dirty 
        // valid/invalid status
        $scope.getBtnClasses = function(ngFormContoller) {
            return {
            	"btn-default" : ngFormContoller.$pristine,
            	"btn-danger" : ngFormContoller.$dirty && ngFormContoller.$invalid,
            	"btn-primary": ngFormContoller.$dirty && ngFormContoller.$valid
            };
          };
        
        // ============================================================
          
    	$scope.removeKeyword = function ( index ) {
    		$log.debug("removing MOCLE at index " + index);
    	    $scope.elfin.IDENTIFIANT.MOTCLE.splice(index,1);
    	    $scope.elfinForm.$setDirty();
    	};
    	
    	// Wrapper for ELFIN PUT (update) operation
        $scope.putElfin = function (elfin) {
        	$log.debug("HbCardContainerController putElfin called at " + new Date());
       		elfin.put().then( 
       			function() { 
       				$log.debug("All ok");
       				// Considered good practice to reload the actual db  
       				// content unless server load is a concern.
       				$scope.getElfin($scope.collectionId,$scope.elfinId);
       				$scope.elfinForm.$setPristine();
       			}, 
       			function(response) { 
       				$log.debug("Error with status code", response.status);
       				var message = "La mise à jour a échoué (statut de retour: "+ response.status+ ")";
					hbAlertMessages.addAlert("danger",message);
       			} 
       		);
        };
        
    	// Wrapper for ELFIN DELETE operation
        $scope.delElfin = function (elfin) {
        	
        	$log.debug("HbCardContainerController delElfin called at " + new Date());
        	
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
               				$log.debug("Error: ELFIN delete failure with status code", response.status);
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
                $log.debug('Modal dismissed at: ' + new Date());
            });
        };

        
        $scope.getElfin = function (collectionId, elfinId) {
        	
        	$log.debug("HbCardContainerController getElfin called at " + new Date());
        	
        	if (GeoxmlService.validateId(collectionId) && GeoxmlService.validateId(elfinId)) {
		        GeoxmlService.getElfin(collectionId, elfinId).get()
		        .then(function(elfin) {
		        	// Force CAR array sorting by POS attribute
		        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
		        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
		        	//       Need review of other similar operations
		        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
		        		$log.debug("Found CARSET/CAR...");
		        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
		        	} else {
		        		$log.debug("No CARSET/CAR...");
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
                
        
    }]);


})();