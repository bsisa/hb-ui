/**
 * hb5 module definition file. Currently contains config, run and filter definitions.
 * each of these might move to their own specific files depending on their 
 * increasing complexity, verbosity.
 *  
 * @author Guy de Pourtalès
 * @author Patrick Refondini 
 */
(function() {
	var hb5 = angular.module('hb5', [ 'hbUi.sse', 'flow',
			'ui.grid', 'ui.grid.selection', 'ngAnimate', 'geoxml', 'hbMap',
			'hbUi.geo', 'ngRoute', 'ui.bootstrap', 'localytics.directives',
			'leaflet-directive', 'ui.utils', 'angular.filter' ]);
	
    // ================================================================
    // ====                      Config                            ====
    // ================================================================    

    /**
     * Client side routes configuration
     */
    hb5.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/assets/views/welcome.html',
                controller: [ '$scope', '$location', '$timeout', '$log', 'hbPrintService', function($scope, $location, $timeout, $log, hbPrintService) {

                	$scope.selectedBusinessName = "";
                	var businessDashboardLoadWaitTimeMillisec = 2500;
                	var activeJob = hbPrintService.getActiveJob();
                	
                	$scope.init = function() {
                		$timeout(function() {
                			activeJob = hbPrintService.getActiveJob();
                    	}, 500, true); 
                		
                		$scope.redirectToDashboard();                		
                	};
                	
                	$scope.redirectToDashboard = function() {

                    	// Set job / business name to display to end user during 
                    	// businessDashboardLoadWaitTimeMillisec time
                    	if (activeJob) {
                    		$scope.selectedBusinessName = activeJob['IDENTIFIANT']['NOM'];
                    	} else {
                    		$scope.selectedBusinessName = "";
                    	}                		
                		
                		$timeout(function() {
                			//$log.debug(">>>> businessDashboardLoadWaitTimeMillisec = "+businessDashboardLoadWaitTimeMillisec+" <<<<");
                			activeJob = hbPrintService.getActiveJob();
                    		if (activeJob['CARACTERISTIQUE']['CARSET'] && activeJob['CARACTERISTIQUE']['CARSET']['CAR'][0].VALEUR) {
                    			$location.path( '/' + activeJob['CARACTERISTIQUE']['CARSET']['CAR'][0].VALEUR);
                    		} else {
                    			$location.path( '/SBAT' );
                    		}
                    		// We want value > 0 only at controller initialisation time.
                    		businessDashboardLoadWaitTimeMillisec = 0;
                    	}, businessDashboardLoadWaitTimeMillisec, true);                    	
                    	
                	};                	
                	
                	$scope.init();
                }]
            })
            .when('/DOM', {
                templateUrl: '/assets/views/indexDom.html'
            })
            .when('/SDS', {
                templateUrl: '/assets/views/indexSds.html'
            })
            .when('/SBAT', {
                templateUrl: '/assets/views/indexSbat.html'
            })            
            .when('/elfin/create/ACTEUR', {
                templateUrl: '/assets/views/ACTEUR_card_new_view.html'
            })            
            .when('/elfin/create/ACTEUR', {
                templateUrl: '/assets/views/ACTEUR_card_new_view.html'
            })
            .when('/elfin/:collectionId/ACTEUR/:elfinId', {
                templateUrl: '/assets/views/ACTEUR_card_view.html'
            })
            .when('/elfin/:collectionId/ACTEUR', {
                templateUrl: '/assets/views/ACTEUR_list_view.html'
            })
            .when('/elfin/create/AMENAGEMENT_SPORTIF', {
                templateUrl: '/assets/views/AMENAGEMENT_SPORTIF_card_new_view.html'
            })            
            .when('/elfin/:collectionId/AMENAGEMENT_SPORTIF/:elfinId', {
                templateUrl: '/assets/views/AMENAGEMENT_SPORTIF_card_view.html'
            })
            .when('/elfin/:collectionId/AMENAGEMENT_SPORTIF', {
                templateUrl: '/assets/views/AMENAGEMENT_SPORTIF_list_view.html'
            })            
            .when('/elfin/create/CITERNE', {
                templateUrl: '/assets/views/CITERNE_card_new_view.html'
            })                                    
            .when('/elfin/:collectionId/CITERNE/:elfinId', {
                templateUrl: '/assets/views/CITERNE_card_view.html'
            })
            .when('/elfin/create/CODE', {
                templateUrl: '/assets/views/CODE_card_new_view.html'
            })
            .when('/elfin/:collectionId/CODE/:elfinId', {
                templateUrl: '/assets/views/CODE_card_view.html'
            })
            .when('/elfin/:collectionId/CODE', {
                templateUrl: '/assets/views/CODE_list_view.html'
            })
            .when('/elfin/create/COMMANDE', {
                templateUrl: '/assets/views/COMMANDE_card_new_view.html'
            })
            .when('/elfin/:collectionId/COMMANDE/:elfinId', {
                templateUrl: '/assets/views/COMMANDE_card_view.html'
            })
            .when('/elfin/:collectionId/COMMANDE', {
                templateUrl: '/assets/views/COMMANDE_list_view.html'
            })
            .when('/elfin/create/CONSTAT', {
                templateUrl: '/assets/views/CONSTAT_card_new_view.html'
            })
            .when('/elfin/:collectionId/CONSTAT/:elfinId', {
                templateUrl: '/assets/views/CONSTAT_card_view.html'
            })
            .when('/elfin/:collectionId/CONSTAT', {
                templateUrl: '/assets/views/CONSTAT_list_view.html'
            })
            .when('/elfin/create/CONTRAT', {
                templateUrl: '/assets/views/CONTRAT_card_new_view.html'
            })
            .when('/elfin/:collectionId/CONTRAT/:elfinId', {
                templateUrl: '/assets/views/CONTRAT_card_view.html'
            })
            .when('/elfin/:collectionId/CONTRAT', {
                templateUrl: '/assets/views/CONTRAT_list_view.html'
            })
            .when('/elfin/create/EQUIPEMENT_SPORTIF', {
                templateUrl: '/assets/views/EQUIPEMENT_SPORTIF_card_new_view.html'
            })            
            .when('/elfin/:collectionId/FONTAINE/:elfinId', {
                templateUrl: '/assets/views/FONTAINE_card_view.html'
            })
            .when('/elfin/:collectionId/FONTAINE', {
                templateUrl: '/assets/views/FONTAINE_list_view.html'
            })
            .when('/elfin/create/HORLOGE', {
                templateUrl: '/assets/views/HORLOGE_card_new_view.html'
            })
            .when('/elfin/:collectionId/HORLOGE/:elfinId', {
                templateUrl: '/assets/views/HORLOGE_card_view.html'
            })
            .when('/elfin/:collectionId/HORLOGE', {
                templateUrl: '/assets/views/HORLOGE_list_view.html'
            })
            .when('/elfin/create/IMMEUBLE', {
                templateUrl: '/assets/views/IMMEUBLE_card_new_view.html'
            })            
            .when('/elfin/:collectionId/IMMEUBLE/:elfinId', {
                templateUrl: '/assets/views/IMMEUBLE_card_view.html'
            })
            .when('/elfin/:collectionId/IMMEUBLE', {
                templateUrl: '/assets/views/IMMEUBLE_list_view.html'
            })
            .when('/elfin/create/INSTALLATION_SPORTIVE', {
                templateUrl: '/assets/views/INSTALLATION_SPORTIVE_card_new_view.html'
            })
            .when('/elfin/:collectionId/INSTALLATION_SPORTIVE/:elfinId', {
                templateUrl: '/assets/views/INSTALLATION_SPORTIVE_card_view.html'
            })            
            .when('/elfin/create/PRESTATION', {
                templateUrl: '/assets/views/PRESTATION_card_new_view.html'
            })            
            .when('/elfin/:collectionId/PRESTATION/:elfinId', {
                templateUrl: '/assets/views/PRESTATION_card_view.html'
            })
            .when('/elfin/:collectionId/PRESTATION', {
                templateUrl: '/assets/views/PRESTATION_list_view.html'
            })
            .when('/elfin/create/ROLE', {
                templateUrl: '/assets/views/ROLE_card_new_view.html'
            })
            .when('/elfin/:collectionId/ROLE', {
                templateUrl: '/assets/views/ROLE_list_view.html'
            })
            .when('/elfin/:collectionId/ROLE/:elfinId', {
                templateUrl: '/assets/views/ROLE_card_view.html'
            })
            .when('/elfin/create/SURFACE', {
                templateUrl: '/assets/views/SURFACE_card_new_view.html'
            })            
            .when('/elfin/:collectionId/SURFACE/:elfinId', {
                templateUrl: '/assets/views/SURFACE_card_view.html'
            })
            .when('/elfin/:collectionId/SURFACE', {
                templateUrl: '/assets/views/SURFACE_list_view.html'
            })
            .when('/elfin/create/TRANSACTION', {
                templateUrl: '/assets/views/TRANSACTION_card_new_view.html'
            })            
            .when('/elfin/:collectionId/TRANSACTION/:elfinId', {
                templateUrl: '/assets/views/TRANSACTION_card_view.html'
            })
            .when('/elfin/:collectionId/TRANSACTION', {
                templateUrl: '/assets/views/TRANSACTION_list_view.html'
            })
            .when('/elfin/create/USER', {
                templateUrl: '/assets/views/USER_card_new_view.html'
            })
            .when('/elfin/:collectionId/USER', {
                templateUrl: '/assets/views/USER_list_view.html'
            })
            .when('/elfin/:collectionId/USER/:elfinId', {
                templateUrl: '/assets/views/USER_card_view.html'
            })
            .when('/elfin/create/PRODUCTION_CHALEUR', {
                templateUrl: '/assets/views/PRODUCTION_CHALEUR_card_new_view.html'
            })                                    
            .when('/elfin/:collectionId/PRODUCTION_CHALEUR/:elfinId', {
                templateUrl: '/assets/views/PRODUCTION_CHALEUR_card_view.html'
            })
            .when('/elfin/create/PRODUCTION_FROID', {
                templateUrl: '/assets/views/PRODUCTION_FROID_card_new_view.html'
            })                                    
            .when('/elfin/:collectionId/PRODUCTION_FROID/:elfinId', {
                templateUrl: '/assets/views/PRODUCTION_FROID_card_view.html'
            })
            .when('/elfin/create/VENTILATION', {
                templateUrl: '/assets/views/VENTILATION_card_new_view.html'
            })                                    
            .when('/elfin/:collectionId/VENTILATION/:elfinId', {
                templateUrl: '/assets/views/VENTILATION_card_view.html'
            })                                                
            .when('/elfin/:collectionId/WC', {
                templateUrl: '/assets/views/WC_list_view.html'
            })                        
            .when('/elfin/:collectionId/:classe/:elfinId', {
                templateUrl: '/assets/views/default_card_view.html'
            })
            .when('/elfin/:collectionId/:classe', {
                templateUrl: '/assets/views/default_list_view.html'
            })
            .otherwise({
                redirectTo: '/'
            })
        ;

    }]);

    
	/**
	 * Turns debug log level on and off
	 */
    hb5.config(['$logProvider', function($logProvider) {
        $logProvider.debugEnabled(clientDebugEnabled);
    }]);

    
    /**
     * Benefit from HTML5 history API, provides nicer RESTful URLs.
     * Supported by all browsers (with IE only from version 10).
     * Fallback to hashbang mode if necessary. 
     */
    hb5.config(['$locationProvider', function($locationProvider) {
    	$locationProvider.html5Mode(true);
    }]);    
    
	/**
	 * Configurations for ng-flow HTML5 based file upload directive 
	 * relying on the flow.js  library.
	 */
    hb5.config(['flowFactoryProvider', 'HB_API', function (flowFactoryProvider, HB_API) {
    	flowFactoryProvider.defaults = {
    		target : HB_API.ANNEXE_UPLOAD_URL,
			permanentErrors : [ 401, 404, 500, 501 ],
			maxChunkRetries : 3,
			testChunks: false, // This is only interesting for resume of large upload. Not relevant here.
			chunkRetryInterval : 5000,
			simultaneousUploads : 4,
			withCredentials : true,
			prioritizeFirstAndLastChunk : true, // Simplifies testing for upload completion
			//chunkSize : 1024, // Default is 1*1024*1024 (1Mb) keep it. Note: 1024 used to create very small test data
			singleFile : true
		};
//		flowFactoryProvider.on('catchAll', function(event) {
//			console.log('catchAll', arguments);
//		});
		// Can be used with different implementations of Flow.js
		// flowFactoryProvider.factory = fustyFlowFactory;
    }]);
    
    /**
     * Prevent `unsafe` token be placed before URL such as file:// or chrome-extension:// etc...
     */
    hb5.config(['$compileProvider', function( $compileProvider ) {   
                  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
    }]);
    
    // ================================================================
    // ====                     Filters                            ====
    // ================================================================

    // Moved to dedicated hb5Filters.js file
	

    // ================================================================
    // ====                        Run                             ====
	// ================================================================
	// = This function is executed after injector creation and is the =
	// = right place for application initialisation tasks             =
    // ================================================================        
    
    hb5.run(['Restangular', 'hbAlertMessages', '$location', '$window', '$log', '$locale', '$timeout', function(Restangular, hbAlertMessages, $location, $window, $log, $locale, $timeout){

    	/**
    	 * Manage locale - currently forced to swiss french
    	 */
    	// Swiss french
    	$locale.id = 'fr-ch';
    	// Swiss german
    	//$locale.id = 'de-ch';
    	// Swiss italian
    	//$locale.id = 'it-ch';
    	// French
    	//$locale.id = 'fr';



    	$log.debug("Setting locale to : " + $locale.id);    	
    	
        Restangular.setErrorInterceptor(
    	        function(response) {
    	        	if (response.status == 401) {
    	        		$log.debug("Login required... ");
    	        		$window.location.href='/login';
    	        		//TODO: we might use the following once we create an new custom AngularJS integrated login form 
    	        		//$location.path('/login'); 
    	        	} else if (response.status == 403) {
		        		var errMsg = "Droits d'accès insuffisants pour cette operation. ";
		        		$log.error(errMsg +  " ( " + response.data.DESCRIPTION +" )");
		        		hbAlertMessages.addAlert("danger",errMsg);
    	        	}
    	        	else if (response.status == 404) {
//    	        		for (var property in response) {
//   	        			   console.log("Property name: " + property + ", value: " + response[property]);
//    	        		}
//    	        		var errMsg = "Ressource non disponible. ( " + response.data.DESCRIPTION +" )";
//    	        		$log.error(errMsg);
//    	        		hbAlertMessages.addAlert("danger",errMsg);
    	        		$log.debug("404 - let flow resource not found to application level: Response status ("+response.status+").");
    	        		return response;    	        		
    	        	} 
    	        	else if (response.status == 500) {
    	        		var errMsg = "Erreur du serveur, veuillez s.v.p. prendre contact avec votre administrateur. " ;
    	        		if (response.data.DESCRIPTION) {
    	        			errMsg += "( " + response.data.DESCRIPTION +" )"; 
    	        		} 
    	        		$log.error(errMsg);
    	        		// NOTE: reactivated for extensive testing. The former problem
    	        		// was most certainly due to the "Java date parser wrong usage"
    	        		// fixed issue.
    	        		// 
    	        		// The following comment is deprecated but currently kept as reminder: 
    	        		// 
    	        		// Error 500 sometime shows up on xhr "wake up" without affecting 
    	        		// the application behaviour to the end-user. Thus stop launching 
    	        		// annoying dialog to the end-user with information he cannot act
    	        		// upon. Keep logging error in case annother true exception case 
    	        		// need investigations.
//    	        		hbAlertMessages.addAlert("danger",errMsg);
    	        		return response;
    	        	} 
    	        	else if (response.status == 566) { // 566 - Custom code for connect exception
    	        		var errMsg = "La connection avec le serveur de base de donnée n'a pas pu être établie. Veuillez s.v.p. prendre contact avec votre administrateur. ( " + response.data.DESCRIPTION +" )";
    	        		$log.error(errMsg);
    	        		hbAlertMessages.addAlert("danger",errMsg);    	        		
    	        	} else if (response.status == 567) { // 567 - Custom code for ElfinFormatException
    	        		var userErrMsg = "La conversion de l' objet ELFIN.Id = " + response.data.ELFIN_Id + ", ELFIN.ID_G = "+ response.data.ELFIN_ID_G +" a échoué. Veuillez s.v.p. prendre contact avec votre administrateur système.";
    	        		$log.error("ElfinFormatException ("+response.status+"): ERROR = " + response.data.ERROR + ", DESCRIPTION = " + response.data.DESCRIPTION + ", User message = " + userErrMsg);
    	        		hbAlertMessages.addAlert("danger",userErrMsg);
    	        	} else if (response.status == 568) { // 568 - Custom code for PasswordHashException
    	        		var userErrMsg = "L'obtention du hachage encrypté du mot de passe a échoué. Veuillez s.v.p. prendre contact avec votre administrateur système.";
    	        		$log.error("PasswordHashException ("+response.status+"): ERROR = " + response.data.ERROR + ", DESCRIPTION = " + response.data.DESCRIPTION + ", User message = " + userErrMsg);
    	        		hbAlertMessages.addAlert("danger",userErrMsg);
    	        	} else if (response.status == 701) { // 701 - Custom success code for HEAD not found tests
    	        		$log.debug("701 - Custom success code for HEAD not found tests ("+response.status+").");
    	        		return response;
    	        	}  
    	        	// General 404 processing forbids ability to use HEAD for resource existence check.
    	        	// Indeed a 404 is a perfectly correct status when testing a resource does not yet exists.
    	        	else {
    	        		var errMsg = "Une erreur s'est produite, veuillez s.v.p. prendre contact avec votre administrateur et lui communiquer le statut suivant: HTTP ERROR: " + response.status ;
    	        		$log.error(errMsg);
    	        		hbAlertMessages.addAlert("danger",errMsg);    	        		
    	        	}
    	          $log.debug("Restangular error interceptor caught: status: " + response.status);
    	          return false; // stops the promise chain
    	      });        		
        

        
// ====================================================================
//      Restangular interceptors tests
//====================================================================        
        
    	/**
    	 *  Please note that ResponseInterceptor is never called when ErrorInterceptor is called,
    	 *  it should have been better named NonErrorResponseInterceptor (100 Infos, 200 Successes, 300 Redirects)
    	 *  
    	 *  data: The data received from the server
    		operation: The operation made. It'll be the HTTP method used except for a GET which returns a list of element which will return getList so that you can distinguish them.
    		what: The model that's being requested. It can be for example: accounts, buildings, etc.
    		url: The relative URL being requested. For example: /api/v1/accounts/123
    		response: Full server response including headers
    		deferred: The deferred promise for the request.
    	 */
    	// Note: use addResponseInterceptor with newer restangular versions
    	// Configurer.addResponseInterceptor(
//        Restangular.setResponseInterceptor(
//    			function(data,operation,what,url,response,deferred) {
//    	          $log.debug("Restangular response interceptor caught: status: " + response.status + 
//    	        		  ", operation: " + operation + 
//    	        		  ", what: " + what + 
//    	        		  ", url: " + url);
//    				
//    	          $log.debug(url + " - response : "+ new Date());
//    	          
//    	          // Important: The responseInterceptor must return the restangularized data element.
//    	          // https://github.com/mgonto/restangular#seterrorinterceptor
//    	          return data; 
//    		});        
        
//        Restangular.setFullRequestInterceptor(
//    			function(element, operation, what, url,  headers, params) {
//    				$log.debug(new Date() + " - Restangular FullRequestInterceptor : \n" + 
//    					"element: " + angular.toJson(element) + "\n" +
//    					"operation: " + operation + "\n" +
//      	        		", what: " + what + "\n" +
//      	        		", url: " + url  + "\n" +
//      	        		", headers: " + angular.toJson(headers) + "\n" +
//      	        		", params: " + angular.toJson(params));
//    				$log.debug(url + " - request  : "+ new Date());    				
//    			}
//    		);
        

//        Restangular.setDefaultHttpFields({cache: true});

// ====================================================================
        
    }]);	
    
   
})();


