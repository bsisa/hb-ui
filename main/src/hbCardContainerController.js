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
     * 
     * This controller logic is meant to be inherited by all hb-xxx-card directives 
     * provided they declare: require: '^hbCardContainer'
     * 
     * See: hb-immeuble-card, hb-constat-card, hb-acteur-card for examples. 
     */
    angular.module('hb5').controller('HbCardContainerController', [
        '$scope', 'GeoxmlService', '$modal', '$routeParams', '$location', '$log', 'hbAlertMessages', 'hbUtil', 'HB_EVENTS',
        function($scope, GeoxmlService, $modal, $routeParams, $location, $log, hbAlertMessages, hbUtil, HB_EVENTS) {
    
    	$log.debug("HbCardContainerController called at " + new Date());
    	
    	// Parameters extracted from the URL and identifying the ELFIN to be edited  
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        
        // The ELFIN to be edited once obtained from REST API.
        $scope.elfin = null;
        
        // ============================================================
        // Button bar layout helpers
        // ============================================================
        
        /**
         * Help managing enable/disable state of ELFIN save button 
         */
        $scope.canSave = function() {
        	return $scope.elfinForm.$dirty && $scope.elfinForm.$valid;
        };
        
        /** 
         * Help manage button class depending on pristine/dirty
         * valid/invalid status
         */
        $scope.getBtnClasses = function(ngFormContoller) {
            return {
            	"btn-default" : ngFormContoller.$pristine,
            	"btn-danger" : ngFormContoller.$dirty && ngFormContoller.$invalid,
            	"btn-primary": ngFormContoller.$dirty && ngFormContoller.$valid
            };
          };
        
		// ============================================
		// validation helpers
        // TODO: add null check for ngModelControllers...
		// ============================================
          
		$scope.getCssLabelFeedback = function (formController) {
			return {
				"label-danger" : formController.$dirty && formController.$invalid,
				"label-success" : formController.$dirty && formController.$valid, 
				"label-warning" : formController.$pristine && formController.$invalid, // Might happen if database data does not fulfill a client side validation rule.
				"label-primary" : formController.$pristine && formController.$valid
			};
		};
		
		$scope.getCssHasFeedback = function (ngModelController) {
			return {
				"has-error" : ngModelController.$dirty && ngModelController.$invalid,
				"has-success" : ngModelController.$dirty && ngModelController.$valid, 
				"has-warning" : ngModelController.$pristine && ngModelController.$invalid // unexpected situation
			};
		};						
		
		$scope.getCssGlyphFeedback = function (ngModelController) {
			return {
				"glyphicon-remove" : ngModelController.$dirty && ngModelController.$invalid,
				"glyphicon-ok" : ngModelController.$dirty && ngModelController.$valid, 
				"glyphicon-warning-sign" : ngModelController.$pristine && ngModelController.$invalid // unexpected situation
			};
		};

//			$scope.hasError = function(ngModelController,
//					errorkey) {
//				return ngModelController.$error[errorKey];
//			};												
		// ============================================          


        /**
         * Manages elfin.IDENTIFIANT.MOTCLE array elements removal.
         */
    	$scope.removeKeyword = function ( index ) {

    		// Get the value of the MOTCLE to remove
    		var keywordToRemoveValue = $scope.elfin.IDENTIFIANT.MOTCLE[index].VALUE;
    		
    		// Only set elfinForm to dirty status if it is not an empty string.
    	    if (keywordToRemoveValue && keywordToRemoveValue.trim() !== '') {
        	    $scope.elfinForm.$setDirty();
    	    } else {
    	    	// do nothing 
    	    }
    		$scope.elfin.IDENTIFIANT.MOTCLE.splice(index,1);
    	};
    	
    	/**
    	 * Wrapper for ELFIN PUT (update) operation
    	 */
        $scope.putElfin = function (elfin) {
        	$log.debug("HbCardContainerController putElfin called at " + new Date());
       		elfin.put().then( 
       			function() { 
       				$log.debug("All ok");
       				// Considered good practice to reload the actual db  
       				// content unless server load is a concern.
       				$scope.getElfin($scope.collectionId,$scope.elfinId);
                    $scope.elfinForm.$setPristine();
                    //"elfinUpdatedEvent"
                    $scope.$emit(HB_EVENTS.ELFIN_UPDATED, elfin);
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
                            $scope.$emit(HB_EVENTS.ELFIN_DELETED, elfin);

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
                    $scope.$emit(HB_EVENTS.ELFIN_LOADED, elfin);

                    }, function(response) {
		        	var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
		            hbAlertMessages.addAlert("danger",message);
		        });
            }
            else {
                var message = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
                hbAlertMessages.addAlert("warning",message);
            }
        };

        $scope.getElfin($scope.collectionId, $scope.elfinId);


        // When the card scope is destroyed, signal potential observers
        // That there is no more current elfin displayed
        $scope.$on('$destroy', function() {
            $log.debug('Current elfin card closed');
            $scope.$emit(HB_EVENTS.ELFIN_UNLOADED);
        });

    }]);


})();