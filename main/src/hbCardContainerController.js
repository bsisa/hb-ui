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
        '$scope', '$rootScope', 'GeoxmlService', '$modal', '$routeParams', '$location', '$log', 'hbAlertMessages', 'hbUtil', 'HB_EVENTS', '$attrs',
        function($scope, $rootScope, GeoxmlService, $modal, $routeParams, $location, $log, hbAlertMessages, hbUtil, HB_EVENTS, $attrs) {
    
    	$log.debug("HbCardContainerController called at " + new Date() + " with $routeParams.elfinId = " + $routeParams.elfinId + ", $routeParams.collectionId = " + $routeParams.collectionId);
    	
    	
//		for (var property in $attrs) {
//			$log.debug("Property name: " + property + ", value: " + $attrs[property]);
//		}
    	
		if ($attrs.hbMode) {
			$log.debug(">>>>>>>>>> HB MODE = " + $attrs.hbMode);
		}
		
		if ($attrs.hbElfinClasse) {
			$log.debug(">>>>>>>>>> HB ELFIN CLASSE = " + $attrs.hbElfinClasse);
		}
    	
    	//$scope.operation = "";
    	
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
        	$log.debug(">>>>>>>>>> HbCardContainerController putElfin called at " + new Date());
        	$log.debug(">>>>>>>>>> HbCardContainerController: putElfin: elfin.Id = "+elfin.Id+", elfin.ID_G = "+elfin.ID_G);
        	
        	// Perform POST in create mode
        	if ($attrs.hbMode === "create" && $attrs.hbElfinClasse) {

        		$log.debug(">>>>>>>>>> HbCardContainerController: POST elfin.ID_G: " + elfin.ID_G +", elfin.Id: " + elfin.Id);
        		var restGeoxml = GeoxmlService.getService();
        		restGeoxml.all(elfin.ID_G+ '/' + elfin.Id).post(elfin).then( 
               			function() { 
    	       				$scope.elfin = elfin;
    	                    $scope.elfinForm.$setPristine();
    	                    // TODO: might need to issue an ELFIN_CREATED. Only useful with elfin which are drawn on map
    	                    //$scope.$emit(HB_EVENTS.ELFIN_UPDATED, elfin);
    	                   	var redirUrl = '/elfin/'+elfin.ID_G+'/'+$attrs.hbElfinClasse+'/'+elfin.Id;
    	                   	$log.debug(">>>>>>>>>> HbCardContainerController: redirUrl = " + redirUrl);
    	                   	$location.path( redirUrl );
    	       			}, 
    	       			function(response) { 
    	       				$log.debug("Error with status code", response.status);
    	       				var message = "La création a échoué (statut de retour: "+ response.status+ ")";
    						hbAlertMessages.addAlert("danger",message);
    	       			}
            		);        			
       		
        	} else { // Perform PUT when mode != create

           		elfin.put().then( 
               			function() { 
               				$log.debug(">>>>>>>>>> HbCardContainerController: PUT elfin.ID_G: " + elfin.ID_G +", elfin.Id: " + elfin.Id);
               				// Considered good practice to reload the actual db  
               				// content unless server load is a concern.
               				//$scope.getElfin($scope.collectionId,$scope.elfinId);
               				$scope.getElfin(elfin.ID_G,elfin.Id);
                            $scope.elfinForm.$setPristine();
                            //$scope.operation = "";
                            //"elfinUpdatedEvent"
                            $scope.$emit(HB_EVENTS.ELFIN_UPDATED, elfin);
               			}, 
               			function(response) { 
               				$log.debug("Error with status code", response.status);
               				var message = "La mise à jour a échoué (statut de retour: "+ response.status+ ")";
        					hbAlertMessages.addAlert("danger",message);
               			} 
               		);        		
        		
        	}

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
               				// Flag information useful not to perform GET on deleted resource.
               				$scope.elfinDeleted = true;
               				$location.path("/elfin/" + elfin.ID_G + "/" + elfin.CLASSE);
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


        /**
         * Returns an elfin object. The elfin object is either obtained:
         * 1) From database using collectionId, elfinId parameters with GET HTTP call
         * 2) From HyperBird catalogue for the given ELFIN.CLASSE (without persistence to database yet).  
         */
        $scope.getElfin = function (collectionId, elfinId) {
        	
        	$log.debug(">>>>>>>>>> HbCardContainerController getElfin called at " + new Date());

        	// hb-mode attribute is optionally set on hb-card-container directive
        	//if ($attrs.hbMode === "create" && elfinId === "new") {
        	if ($attrs.hbMode === "create") {

        		$log.debug(">>>>>>>>>> HbCardContainerController: DETECTED NEW ELFIN CREATE OPERATION => GET from HB catalogue.");
        		
        		if ($attrs.hbElfinClasse) {
        			// GET NEW ELFIN FROM CATALOGUE...
        			GeoxmlService.getNewElfin($attrs.hbElfinClasse).get()
    		        .then(function(elfin) {
    		        	// Force CAR array sorting by POS attribute
    		        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
    		        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
    		        	//       Need review of other similar operations
    		        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
    		        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
    		        	}
    		            $scope.elfin = elfin;
    		            
    		            $log.debug(">>>>>>>>>> HbCardContainerController: NEW elfin.Id = "+elfin.Id+", elfin.ID_G = "+elfin.ID_G);
    		            
    		            $scope.elfinForm.$setDirty();

                        //$scope.$emit(HB_EVENTS.ELFIN_LOADED, elfin);
    		            hbAlertMessages.addAlert("info","Création du nouvel objet " + $scope.elfin.CLASSE);
    		        	}, function(response) {
    		        	var message = "Le chargement du nouvel objet de CLASSE = "+$attrs.hbElfinClasse+" a échoué (statut de retour: " + response.status + ")";
    		            hbAlertMessages.addAlert("danger",message);
    		        });  
        			
        			
        		} else {
        			hbAlertMessages.addAlert("danger","La création d'un nouvel objet nécessite l'information ELFIN.CLASSE");	
        		}

        	} else {

        		$log.debug(">>>>>>>>>> STANDARD ELFIN LOAD PROCEDURE for collectionId: " + collectionId + ", elfinId: " + elfinId);
        		
	        	if (GeoxmlService.validateId(collectionId) && GeoxmlService.validateId(elfinId)) {
			        GeoxmlService.getElfin(collectionId, elfinId).get()
			        .then(function(elfin) {
			        	// Force CAR array sorting by POS attribute
			        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
			        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
			        	//       Need review of other similar operations
			        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
			        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
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
        		
        	}
        };

        $scope.getElfin($scope.collectionId, $scope.elfinId);


        // When the card scope is destroyed, signal potential observers
        // That there is no more current elfin displayed
        $scope.$on('$destroy', function() {
            $log.debug('Current elfin card closed');
            // In create mode the elfin instance does not yet exist in the database.
            // If elfin has been deleted the getElfin will failed.
            if ( !($attrs.hbMode === "create") && !$scope.elfinDeleted ) {
	            // Reload the last saved state and propagate to give chance
	            // to any other observer to update eventually their scope
	            GeoxmlService.getElfin($scope.collectionId, $scope.elfinId).get().then(function(elfin) {
	                // We must call the root scope because the scope is already destroyed...
	                $rootScope.$emit(HB_EVENTS.ELFIN_UNLOADED, elfin);
	            }, function() {
	                $rootScope.$emit(HB_EVENTS.ELFIN_UNLOADED);
	            });
            }            
        });


        /**
         * React to elfin update done elsewhere than through the current controller, 
         * for instance via the map.
         */
        $rootScope.$on(HB_EVENTS.ELFIN_UPDATED, function(event, elfin) {

            /**
             * We must not update elfinForm state and elfin when the event was 
             * emitted from the current controller.
             * If condition fixes https://github.com/bsisa/hb-ui/issues/3
             */
        	if (! (event.targetScope === $scope) ) {
	        	$scope.elfin = elfin;
	            $scope.elfinForm.$setDirty();
        	}
        });

    }]);


})();