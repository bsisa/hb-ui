/**
 * hb5 module definition file. Currently contains config, run and filter definitions.
 * each of these might move to their own specific files depending on their 
 * increasing complexity, verbosity.
 *  
 * @author Guy de Pourtalès
 * @author Patrick Refondini 
 */
(function() {
	
    var hb5 = angular.module('hb5',
        ['flow','ngGrid','ngAnimate', 'geoxml', 'hbMap', 'ngRoute', 'ui.bootstrap', 'localytics.directives', 'leaflet-directive', 'ui.utils']);
	
    // ================================================================
    // ====                      Config                            ====
    // ================================================================    

    /**
     * Client side routes configuration
     */
    hb5.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/assets/views/welcome.html'
//                controller: function($scope, $location, $timeout, $log) {
//                	$scope.postWelcome = function() {
//                		$timeout(function() {
//                			// TODO: create a CONSTANT service using angular .constant
//                    		var IMMEUBLE_COLLECTION_ID = 'G20040930101030005';
//                    		$location.path( '/elfin/'+IMMEUBLE_COLLECTION_ID+'/IMMEUBLE' );	
//                    	}, 1250, true);     
//                	};
//                }
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
             .when('/elfin/:collectionId/FONTAINE/:elfinId', {
                templateUrl: '/assets/views/FONTAINE_card_view.html'
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
			chunkRetryInterval : 5000,
			simultaneousUploads : 4,
			withCredentials : true,
			prioritizeFirstAndLastChunk : true,
			//chunkSize : 1024, // Default is 1*1024*1024 (1Mb) keep it. Note: 1024 used to create very small test data
			singleFile : true
		};
//		flowFactoryProvider.on('catchAll', function(event) {
//			console.log('catchAll', arguments);
//		});
		// Can be used with different implementations of Flow.js
		// flowFactoryProvider.factory = fustyFlowFactory;
    }]);
    

    
    // ================================================================
    // ====                     Filters                            ====
    // ================================================================
    
    
    /**
     * Basic filter to add an "s" to result titles 
     * depending on the number of entries returned. 
     */
	hb5.filter('plural', function() {
		return function(number) {
			if (number > 1) {
				return "s";
			} else {
				return "";
			}
		};
	});

	
	/**
	 * Filter tailor to IMMEUBLE list requirements
	 */
	hb5.filter('immeubleListFilter', [function () {

		// case insensitive string contains check
		var icontains = function (targetString, matchString) {
			if (matchString && matchString.trim().length > 0) {
				if (targetString) {
					if (targetString.toLowerCase().indexOf(matchString.toLowerCase()) != -1) {
						return true;
					} else {
						return false;
					}					
				} else { // If a match string is defined and there is no target string we consider it a non match.
					return false;
				}
			} else {
				// returns true if match string empty or undefined.
				return true;
			}
		};
		
		return function (immeubles, predicate) {
	        if (!angular.isUndefined(immeubles) && !angular.isUndefined(predicate)) {
	            var tempImmeubles = [ ];
	            angular.forEach(immeubles, function (immeuble) {
                    if ( 
                    	 icontains(immeuble.PARTENAIRE.PROPRIETAIRE.GROUPE, predicate.owner) &&
                    	 icontains(immeuble.IDENTIFIANT.OBJECTIF, predicate.registerNb) &&
                    	 icontains(immeuble.CARACTERISTIQUE.CARSET.CAR[0].VALEUR, predicate.place) &&
                    	 icontains(immeuble.IDENTIFIANT.NOM, predicate.buildingNb) &&
                    	 icontains(immeuble.IDENTIFIANT.ALIAS, predicate.address)
                    ) {
                    	tempImmeubles.push(immeuble);
                    }
                });
	            return tempImmeubles;
	        } else {
	            return immeubles;
	        }
	    };
	}]);	
	
	 /** Filter tailor to IMMEUBLE list requirements
	 */
	hb5.filter('constatListFilter', [function () {

		// case insensitive string contains check
		var icontains = function (targetString, matchString) {
			if (matchString && matchString.trim().length > 0) {
				if (targetString) {
					if (targetString.toLowerCase().indexOf(matchString.toLowerCase()) != -1) {
						return true;
					} else {
						return false;
					}					
				} else { // If a match string is defined and there is no target string we consider it a non match.
					return false;
				}
			} else {
				// returns true if match string empty or undefined.
				return true;
			}
		};
		
		return function (constats, predicate) {
	        if (!angular.isUndefined(constats) && !angular.isUndefined(predicate)) {
	            var tempConstats = [ ];
	            angular.forEach(constats, function (constat) {
                    if ( 
                    //	 icontains(constat.ACTIVITE.EVENEMENT.ECHEANCE.POUR_QUI, predicate.last_resp) &&
                    	 icontains(constat.IDENTIFIANT.DE, predicate.description) &&
                    	 icontains(constat.IDENTIFIANT.NOM, predicate.constat_date) &&
                    	 icontains(constat.GROUPE, predicate.constat_group) &&
                    	 icontains(constat.IDENTIFIANT.OBJECTIF, predicate.constat_noSAI)
                    ) {
                    	tempConstats.push(constat);
                    	
                    }
                });
	            return tempConstats;
	        } else {
	            return constats;
	        }
	    };
	}]);
	
	

    // ================================================================
    // ====                        Run                             ====
	// ================================================================
	// = This function is executed after injector creation and is the =
	// = right place for application initialisation tasks             =
    // ================================================================        
    
    hb5.run(['Restangular', 'hbAlertMessages', '$location', '$window', '$log', '$locale', '$timeout', function(Restangular, hbAlertMessages, $location, $window, $log, $locale, $timeout){

    	//TODO: Manage locale - check why this does not seem to be effective
    	$log.debug("Setting locale to swiss french: fr-ch");
    	$locale.id = 'fr-ch';
    	
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
    	        		var errMsg = "Ressource non disponible. ( " + response.data.DESCRIPTION +" )";
    	        		$log.error(errMsg);
    	        		hbAlertMessages.addAlert("danger",errMsg);
    	        	} else if (response.status == 500) {
    	        		var errMsg = "Erreur du serveur, veuillez s.v.p. prendre contact avec votre administrateur. " ;
    	        		if (response.data.DESCRIPTION) {
    	        			errMsg += "( " + response.data.DESCRIPTION +" )"; 
    	        		} 
    	        		$log.error(errMsg);
    	        		hbAlertMessages.addAlert("danger",errMsg);
    	        	} else if (response.status == 566) { // 566 - Custom code for connect exception
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
    	        	} else {
    	        		var errMsg = "Une erreur s'est produite, veuillez s.v.p. prendre contact avec votre administrateur et lui communiquer le statut suivant: HTTP ERROR: " + response.status ;
    	        		$log.error(errMsg);
    	        		hbAlertMessages.addAlert("danger",errMsg);    	        		
    	        	}
    	          $log.debug("Restangular error interceptor caught: status: " + response.status);
    	          return false; // stops the promise chain
    	      });        		
        
        
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
        Restangular.setResponseInterceptor(
    			function(data,operation,what,url,response,deferred) {
    	          $log.debug("Restangular response interceptor caught: status: " + response.status + 
    	        		  ", operation: " + operation + 
    	        		  ", what: " + what + 
    	        		  ", url: " + url);
    				
    	          // Important: The responseInterceptor must return the restangularized data element.
    	          // https://github.com/mgonto/restangular#seterrorinterceptor
    	          return data; 
    		});        
        
    }]);	
    
   
})();


