(function() {

	/**
	 * Modal dialog for ELFIN delete operation
	 */
	angular.module('hb5').controller('DeleteConfirmController', ['$scope','$modalInstance',function ($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };        
        
    }]); 
	                                                      
	/**
     * Modal dialog to warn user of possibly unsaved change while quitting the current edit context
     */
	angular.module('hb5').controller('UnsavedWarnDialogController', ['$scope','$modalInstance',function ($scope, $modalInstance) {	

        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };        
        
	}]);    
    
    
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
        '$attrs', '$scope', '$rootScope', 'GeoxmlService', '$modal', '$routeParams', '$location', '$log', '$window', 'hbAlertMessages', 'hbUtil', 'HB_EVENTS', 'HB_ROLE_FONCTION', 'HB_REPORT', 'MapService','hbPrintService', 'hbTabCacheService', 'userDetails',
        function($attrs, $scope, $rootScope, GeoxmlService, $modal, $routeParams, $location, $log, $window, hbAlertMessages, hbUtil, HB_EVENTS, HB_ROLE_FONCTION, HB_REPORT, MapService, hbPrintService, hbTabCacheService, userDetails) {
    
        	
        // Provide dev access rights information to scope
        $scope.devRights = _.contains(userDetails.getRoles(),HB_ROLE_FONCTION.DEV);
        	
        // Expose hbUtil.containsStandardSourceURI function to scope
        $scope.containsStandardSourceURI = hbUtil.containsStandardSourceURI;	
        
    	// Parameters extracted from the URL and identifying the ELFIN to be edited  
        $scope.elfinId = $routeParams.elfinId;
        $scope.collectionId = $routeParams.collectionId;
        
        // The ELFIN to be edited once obtained from REST API.
        $scope.elfin = null;

        // ELFIN.FORM element can contain very large amount of information
        // creating DOM related information even when hidden to the end user
        // by tab is very counter productive in term of GUI reactivity.
        // The following boolean is set to false by default and can be 
        // changed to true by end user activity only when relevant.
		$scope.eagerDomCreation = {"FORM" : false };
        
        // Proceed with initialisation tasks
        init();
        
        /**
         * Used by ui-keypress to provide save action upon user `ENTER` keypress.
         */
        $scope.saveCallback = function ($event,elfin) {
        	if ($scope.canSave()) {
        		$scope.saveElfin(elfin);
        	} else {
        		// Do nothing.
        	}
        	$event.preventDefault();
        };
        
        
        // ============================================================
        // Global navigation buttons (also found in MenuController and
        // hbListContainerController).
        // ============================================================        
        
        /**
         * Go home navigation function
         */
    	$scope.home = function() {
    		var activeJob = hbPrintService.getActiveJob();
    		var dashboardUri = hbUtil.getDashboarUri(activeJob);
    		// Redefine searchObj as empty to get rid of sticky URL parameters 
   			// Note former solution $location.url($location.path(dashboardUri)); 
   			// to this problem triggers an unwanted reload of welcome page
    		var searchObj = {};
			$location.search(searchObj).path( dashboardUri );    		
    	};
        
              
        // ============================================================
        // Map related functionality
        // ============================================================        

    	/**
         *  Default to HIDDEN // TODO: USE CONSTANT: MAP_DISPLAY_TYPE.HIDDEN
         */
        $scope.mapDisplayType = 'HIDDEN';
    	
        /**
         * Used to allow displaying different layout upon map visibility or not. 
         */
        $scope.isMapToggled = function() {
        	return MapService.isMapDisplayed();
        };    	

        // Initial state overrides when clicked from map
        if ($scope.isMapToggled() && $scope.mapDisplayType) {
        	$scope.mapDisplayType = 'SPLIT';
        };        
        
        $scope.switchMapDisplayType = function() {
        	$scope.mapDisplayType = MapService.switchMapDisplayType($scope.mapDisplayType);
        	$scope.$emit(HB_EVENTS.DISPLAY_MAP_VIEW, $scope.mapDisplayType !== 'HIDDEN');
        };        
        
        // ============================================================
        // Button bar layout helpers
        // ============================================================
        
        /**
         * Help managing enable/disable state of ELFIN save button 
         * Please note: canSave is not about ACCESS RIGHT to save.
         * Create/Update ACCESS RIGHT verification is done server side 
         * with feedback to user if forbidden. 
         */
        $scope.canSave = function() {
        	return $scope.elfinForm.$dirty && $scope.elfinForm.$valid;
        };
        
        
        /**
         * Help managing enable/disable state of ELFIN print button 
         */        
        $scope.canPrint = function() {
        	if ($scope.elfin!=null) {
	        	return hbPrintService.hasReportDefinition($scope.elfin.CLASSE,$scope.elfin.GROUPE);
        	} else {
        		return false;
        	}
        };
        
        /**
         * Returns true if current user has global delete role
         * Please note: Unlike canSave canDelete is an ACCESS RIGHT 
         * thin layer on top of CREATE,UPDATE rights to restrain 
         * user with CREATE,UPDATE access rights to DELETE an object,
         * although with update right the whole information of an 
         * object can well be deleted. Forbidding DELETE operation is
         * there to help prevent operations errors. It is also easier
         * to track objects modifications than objects deletions.
         */
        $scope.canDelete = function() {
			// Only users with global delete role can delete data
        	return _.contains(userDetails.getRoles(),HB_ROLE_FONCTION.DELETE);
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
		// ============================================
          
		$scope.getCssLabelFeedback = function (formController) {
			if (formController) {
				return {
					"label-danger" : formController.$dirty && formController.$invalid,
					"label-success" : formController.$dirty && formController.$valid, 
					"label-warning" : formController.$pristine && formController.$invalid, // Might happen if database data does not fulfill a client side validation rule.
					"label-primary" : formController.$pristine && formController.$valid
				};				
			} else {
				return {};
			}

		};
		
		$scope.getCssHasFeedback = function (ngModelController) {
			if (ngModelController) {
				return {
					"has-error" : ngModelController.$invalid,
					"has-success" : ngModelController.$dirty && ngModelController.$valid
				};
				//"has-error" : ngModelController.$pristine && ngModelController.$invalid // unexpected situation
				// has-warning is also available but error seem more appropriate/clearer to the end-user.				
			} else {
				return {};
			}
		};						
		
		$scope.getCssGlyphFeedback = function (ngModelController) {
			if (ngModelController) {
				return {
					"glyphicon-remove" : ngModelController.$dirty && ngModelController.$invalid,
					"glyphicon-ok" : ngModelController.$dirty && ngModelController.$valid, 
					"glyphicon-warning-sign" : ngModelController.$pristine && ngModelController.$invalid // unexpected situation
				};
			} else {
				return {};
			}
		};
							
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
    	 * Extension point to be overridden by child controller to add custom logic
    	 * following common saveElfin behaviour. 
    	 * This is expected to be used to manipulate $location.path/search...
    	 * but can be used for other purposes. 
    	 * 
    	 *  See a working example in hbAmenagementSportifCardController.js: 
    	 *  $scope.$parent.saveElfinPostCallback = function() { ... };
    	 */ 
    	$scope.saveElfinPostCallback = function () {
    	    $log.debug("HbCardContainerController saveElfinPostCallback() NOT overridden.");
    	};
    	
    	/**
    	 * Wrapper for ELFIN create or update (HTTP POST or HTTP PUT) operations.
    	 */
        $scope.saveElfin = function (elfin) {
        	
        	// Perform POST in create mode
        	if ($attrs.hbMode === "create" && $attrs.hbElfinClasse) {

        		var restGeoxml = GeoxmlService.getService();
        		$log.debug(">>>>> create mode: perform POST to: elfin.ID_G/elfin.Id = " + elfin.ID_G+ '/' + elfin.Id);
        		
  				// Override IDENTIFIANT/GER with current data manager access rights. 
   				// If no IDENTIFIANT/GER exists it will be created
   				elfin.IDENTIFIANT.GER = GeoxmlService.getCurrentDataManagerAccessRightsCreateUpdate();
        		
        		restGeoxml.all(elfin.ID_G+ '/' + elfin.Id).post(elfin).then( 
               			function() {
    	       				$scope.elfin = elfin;
    	                    $scope.elfinForm.$setPristine();
    	                   	var redirUrl = '/elfin/'+elfin.ID_G+'/'+$attrs.hbElfinClasse+'/'+elfin.Id;
    	                   	$location.path( redirUrl );
    	       			}, 
    	       			function(response) { 
    	       				$log.debug("Error in saveElfin POST operation with status code", response.status);
    	       				var message = "La création a échoué (statut de retour: "+ response.status+ ")";
    						hbAlertMessages.addAlert("danger",message);
    	       			}
            		);        			
       		
        	} else { // Perform PUT when mode != create

        		$log.debug(">>>>> edit mode: perform PUT for elfin.Id = " + elfin.Id);
           		elfin.put().then( 
               			function() { 
               				// Considered good practice to reload the actual elfin state from db after successful PUT unless server load is a concern.
               				$scope.getElfin(elfin.ID_G,elfin.Id, HB_EVENTS.ELFIN_UPDATED);
                            $scope.elfinForm.$setPristine();
                            $scope.saveElfinPostCallback();
                            // Notify other controllers this elfin has been updated (used by map)
                            //$scope.$emit(HB_EVENTS.ELFIN_UPDATED, elfin);
               			}, 
               			function(response) { 
               				$log.debug("Error in saveElfin PUT operation with status code", response.status);
               				var message = "La mise à jour a échoué (statut de retour: "+ response.status+ ")";
        					hbAlertMessages.addAlert("danger",message);
               			} 
               		);        		
        		
        	}

        };

        
    	// Wrapper for ELFIN DELETE operation
        $scope.delElfin = function (elfin) {
        	if ($scope.canDelete()) {

	        	var modalInstance = $modal.open({
	                templateUrl: '/assets/views/deleteConfirmModalPanel.html',
	                controller: 'DeleteConfirmController',
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
	
	               				// If the current deleted ELFIN contains a valid link to a parent object redirect to the parent object 
	               				// else redirect to the root navigation path
	               				if (hbUtil.containsStandardSourceURI(elfin.SOURCE) ) {
	               					$location.path("/elfin/" + elfin.SOURCE);
	               				} else {
	               					$scope.home();
	               				}
	               				
	               				// Notify other controllers this elfin has been deleted (used by map)
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
        	} else {
        		hbAlertMessages.addAlert("warning","Vous n'avez pas les droits suffisants pour effectuer cette opération.");
        	}            
        };
        
        /**
         * Prints the default report for this ELFIN CLASSE/GROUPE
         */
        $scope.printReport = function (elfin) {
        	$window.open(hbPrintService.getReportUrl(elfin), "Impression rapport");
        };

        
        /**
         * Helper to deal with enabled / disabled status for labels report.
         */
        $scope.hasLabelsReport = function (elfin) {
        	return (elfin !== null) ? hbPrintService.hasReportDefinition(elfin.CLASSE,HB_REPORT.CLASSIFIER_LEVEL2_LABELS) : false;
        }
        
        /**
         * Prints labels report designed for IMMEUBLE only.
         */
        $scope.printLabelsReport = function (elfin) {
        	hbPrintService.getReportOrProvideFeedbackForMissingConfig(elfin,elfin.CLASSE,HB_REPORT.CLASSIFIER_LEVEL2_LABELS);
        }
        
        /**
         * Display JSON data for 'elfin' - Only allowed to 'dev' users
         */
        $scope.displayJson = function (elfin) {
        	if ($scope.devRights) {
	        	var apiCallForJs = "/api/melfin/"+elfin.ID_G+"/"+elfin.Id+"?format=json-pretty";
	        	$window.open(apiCallForJs, "Javascript format");
        	}
        	 
        };

        /**
         * Display XML data for 'elfin' - Only allowed to 'dev' users
         */
        $scope.displayXml = function (elfin) {
        	if ($scope.devRights) {
	        	var apiCallForXml = "/api/melfin/"+elfin.ID_G+"/"+elfin.Id+"?format=xml";
	        	$window.open(apiCallForXml, "Javascript format");
        	}
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

		// Updates photoSrc property with first available photo.
    	$scope.updatePhotoSrc = function() {
            if ($scope.elfin.ANNEXE) {
            	// In case there are several pictures, reverse loop provides most recent first. 
            	for (var i = $scope.elfin.ANNEXE.RENVOI.length - 1; i >= 0; i--) {
	            //for (var i = 0; i < $scope.elfin.ANNEXE.RENVOI.length; i++) {
					
	            	var currentRenvoi = $scope.elfin.ANNEXE.RENVOI[i];
					
					if ( currentRenvoi.VALUE.toLowerCase().indexOf("photo") != -1 ) {
						// Photo found build link
						var photoLink = currentRenvoi;
						$scope.photoSrc = hbUtil.getLinkFileApiUrl($scope.elfin.ID_G, $scope.elfin.Id, photoLink.LIEN);
						break;
					} else {
						// No photo found (other annex)
					}
				}
            }							    		
    	};		        
        

        /**
         * Proceed to initialisation tasks
         */
        function init() {
        	//$log.debug("function init() called");
        	// Trigger a warning dialogue to the end-user if there are pending changes.
        	// onRouteChangeOff is a function intended to turn listener off when called.
        	//onRouteChangeOff = $rootScope.$on('$locationChangeStart', routeChange);
        	onRouteChangeOff = $rootScope.$on('$locationChangeStart', routeChange);
      	}

        /**
         * tabState data structure is expected to be set by child controllers
         * while hbTabCacheService is maintained hereafter from routeChange 
         * function.
         */
        $scope.tabState = {};
        
        /**
         * Notify end-user of pending modifications if any.
         */
        function routeChange(event, nextUrl, currentUrl) {

        	// Maintain tabState per URL
        	hbTabCacheService.setTabState(currentUrl, $scope.tabState);

        	/** Deregister rootScope listener, current scope shall be destroyed 
        	 *  when actual location change succeeds. 
        	 */ 
        	onRouteChangeOff();
        	
        	// =======================================================================
        	//                         Disabled feature 
        	// Notify user if there is something to be saved, else navigate to nextUrl
        	//     TODO: Investigations needed before re-activating this feature
        	// =======================================================================
  
        	// Noticed unexpected behaviour in Windows IE context, need to be reproduced.
        	
        	//Navigate to nextUrl if the form isn't dirty
//        	// Notify user if there is something to be saved, else navigate to nextUrl  
//        	if ($scope.canSave() == true) {
//        		// Prevent default navigation to nextUrl to let end user decision happen
//    			if (event.preventDefault) {	event.preventDefault(); }
//
//            	var modalInstance = $modal.open({
//                    templateUrl: '/assets/views/unsavedWarnDialog.html',
//                    controller: 'UnsavedWarnDialogController',
//                    scope: $scope,
//                    backdrop: 'static'
//                });
//
//                modalInstance.result.then(function (nada) {
//                	// User wants to save modifications. Navigation cancellation is what we have and want.
//                	//$log.debug('Modal confirmed at: ' + new Date() + ' should stay on : ' + currentUrl);
//                }, function () {
//                	// The user accepts loosing modification and navigating further.
//                	//$log.debug('Modal dismissed at: ' + new Date() + ' should go to : ' + nextUrl);
//                	// Stop listening for location changes to prevent deadloop
//                	onRouteChangeOff();
//                	// Perform location change using nextUrl parameter.
//                	$location.$$parse(nextUrl);
//                	//$log.debug('Parsed URL: ' + nextUrl + "$location.absURL = " + $location.absUrl());
//                	
//                });	
//                
//        	} else {
//        		//$log.debug(' >>>>> ROOTSCOPE EVENT :::: with no pending change.');
//        	}        	

        	// =======================================================================
        	//                         Disabled feature - end
        	// =======================================================================        	
        }        
        
        
        

        /**
         * Returns an elfin object. The elfin object is either obtained:
         * 1) From database using collectionId, elfinId parameters with GET HTTP call
         * 2) From HyperBird catalogue for the given ELFIN.CLASSE (without persistence to database yet).  
         */
        $scope.getElfin = function (collectionId, elfinId, hbEventType) {
    		
        	// hb-mode attribute is optionally set as hb-card-container directive (sibling) attribute
        	if ($attrs.hbMode === "create") {

        		if ($attrs.hbElfinClasse) {
        			// GET new ELFIN from HyperBird catalogue
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
    		            $scope.elfinForm.$setDirty();
    		        	}, function(response) {
    		        	var message = "Le chargement du nouvel objet de CLASSE = "+$attrs.hbElfinClasse+" a échoué (statut de retour: " + response.status + ")";
    		            hbAlertMessages.addAlert("danger",message);
    		        });  
        			
        			
        		} else {
        			hbAlertMessages.addAlert("danger","La création d'un nouvel objet nécessite l'information ELFIN.CLASSE");	
        		}

        	} else {
        		
        		// Fails for considered valid values. TODO: review validation rules before reactivating or remove. 
        		//if (GeoxmlService.validateId(collectionId) && GeoxmlService.validateId(elfinId)) {
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
			            // Can be HB_EVENTS.ELFIN_LOADED, HB_EVENTS.ELFIN_UPDATED depending whether called from put/get
			            $scope.$emit(hbEventType, elfin);
			        	}, function(response) {
			        	var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
			            hbAlertMessages.addAlert("danger",message);
			        });
//	            }
//	            else {
//	                var message = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
//	                hbAlertMessages.addAlert("warning",message);
//	            }        		
        		
        	}
        };

        $scope.getElfin($scope.collectionId, $scope.elfinId, HB_EVENTS.ELFIN_LOADED);

       
        /** 
         * When the card scope is destroyed, signal potential observers
         * That there is no more current elfin displayed
         */
        $scope.$on('$destroy', function() {
        	
            $log.debug('Current elfin card closed (controller $destroy) for $location.url = ' + $location.url());
        	
            // Get elfin will fail if: 
        	// 1) In create mode the elfin instance does not yet exist in the database 
            // 2) Elfin has been deleted
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
            
            // Unregister $rootScope listener to prevent memory leak
            elfinUpdatedListenerUnregister();
        });


        /**
         * React to elfin update done elsewhere than through the current controller, 
         * for instance via the map.
         */
        var elfinUpdatedListenerUnregister = $rootScope.$on(HB_EVENTS.ELFIN_UPDATED, function(event, elfin) {

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