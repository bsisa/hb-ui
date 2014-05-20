/**
 * Created by guy on 19.01.14.
 */

(function() {
	
    var hb5 = angular.module('hb5', ['ngGrid','ngAnimate', 'geoxml', 'ngRoute', 'ui.bootstrap', 'localytics.directives']);
	
    hb5.run(['Restangular', 'hbAlertMessages', '$location', '$window', function(Restangular, hbAlertMessages, $location, $window){
        Restangular.setErrorInterceptor(
    	        function(response) {
    	        	if (response.status == 401) {
    	        		console.log("Login required... ");
    	        		$window.location.href='/login';
    	        		//TODO: we might use the following once we create an new custom AngularJS integrated login form 
    	        		//$location.path('/login'); 
    	        	} else if (response.status == 404) {
    	        		hbAlertMessages.addAlert("danger","Ressource non disponible");
    	        	} else if (response.status == 500) {
    	        		hbAlertMessages.addAlert("danger","Erreur du serveur, veuillez s.v.p. prendre contact avec votre administrateur. Note: Vérifiez que la base de donnée soit accessible.");
    	        	} else if (response.status == 566) { // 566 - Custom code for connect exception
    	        		hbAlertMessages.addAlert("danger","La connection avec le serveur de base de donnée n'a pas pu être établie. Veuillez s.v.p. prendre contact avec votre administrateur.");    	        		
    	        	} else {
    	        		hbAlertMessages.addAlert("danger","Une erreur s'est produite, veuillez s.v.p. prendre contact avec votre administrateur et lui communiquer le statut suivant: HTTP ERROR: " + response.status );    	        		
    	        	}
    	          console.log("Restangular error interceptor caught: status: " + response.status);
    	          return false; // stop the promise chain
    	      });        		
        
        
    	/**
    	 *  Please note that ResponseInterceptor is never called when ErrorInterceptor is called,
    	 *  it should have been better named NonErrorResponseInterceptor (100 Infos, 200 Successes, 300 Redirects)
    	 *  
    	 *  data: The data received got from the server
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
    				//TODO: remove this debug log
//    	          console.log("Restangular response interceptor caught: status: " + response.status + 
//    	        		  ", operation: " + operation + 
//    	        		  ", what: " + what + 
//    	        		  ", url: " + url);
    				
    	          // Important: The responseInterceptor must return the restangularized data element.
    	          // https://github.com/mgonto/restangular#seterrorinterceptor
    	          return data; 
    		});        
        
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
     * Client side routes configuration
     */
    hb5.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/assets/views/welcome.html',
                controller: function($scope) {}
            })
            .when('/elfin/:collectionId/IMMEUBLE/:elfinId', {
                templateUrl: '/assets/views/IMMEUBLE_card_view.html',
                controller: 'ImmeubleCardController'
            })
            .when('/elfin/:collectionId/CONSTAT/:elfinId', {
                templateUrl: '/assets/views/CONSTAT_card_view.html'
//                controller: 'ConstatCardController'
            })
            .when('/elfin/:collectionId/ACTEUR/:elfinId', {
                templateUrl: '/assets/views/ACTEUR_card_view.html',
                controller: 'ActeurCardController'
            })                        
            .when('/elfin/:collectionId/:classe/:elfinId', {
                templateUrl: '/assets/views/default_card_view.html'
            })
            .when('/elfin/:collectionId/IMMEUBLE', {
                templateUrl: '/assets/views/IMMEUBLE_list_view.html'
            })
            .when('/elfin/:collectionId/ACTEUR', {
                templateUrl: '/assets/views/ACTEUR_list_view.html'
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
	 * Small service used to exchange alert messages data between miscellaneous controllers.
	 * For instance when deleting a card the success message must be displayed on the
	 * redirect to page within redirect page controller scope.
	 * 
	 * Could not find the exhaustive list of alert types but they seem to fit with 
	 * Bootstrap following styles: {primary, info, success, warning, danger, inverse}
	 */
	hb5.service('hbAlertMessages', function () {
		
		var alerts = [ ];
		
        return {
            getAlerts:function () {
            	console.log("hbAlertMessages service getAlerts for " + alerts.length + " alerts!");
                return alerts;
            },
            addAlert:function (typeValue,messageValue) {
            	alerts.push({type: typeValue, message: messageValue});
            },
            removeAlert:function(index) {
                alerts.splice(index, 1);
            }
        };
    });	
	
	/**
	 * Small service used intended to share functions not states between miscellaneous controllers
	 * without duplicating code.
	 */
	hb5.service('hbUtil', function () {

        /**
         * Sort any array by its elements POS property.
         * Assumes the array elements possess POS property of Int type.  
         */
        var reorderArrayByPOS = function(array) {
            array.sort(function(a, b) {
                return parseInt(a.POS) - parseInt(b.POS);
            });
        };		
		
        
        /**
         * Builds a URL query string such as "?FIRST_PARAM=test&SECOND_PARAM=xxx"
         * where parameters is expected to be an array of objects with 
         * name and value properties.
         */
        var buildUrlQueryString = function(parameters) {
	        var queryString = "";
	    	for (var i=0; i < parameters.length; i++) {
	    		var field = parameters[i];
	    		if (i===0) {
	    			queryString += "?" + field.name + "=" + field.value;
	    		} else {
	    			queryString += "&" + field.name + "=" + field.value;
	    		}
	    	}
	    	return queryString;
        };
        
        /**
         * Transforms parameters array of objects with properties {label,name,value}
         * to a single object with {key1:value1, key2:value2, key3,value3} 
         * where names are mapped to keys and values to values.
         */
        var buildKeyValueObject = function(parameters) {
	        var keyValueObj = {};
	    	for (var i=0; i < parameters.length; i++) {
	    		var field = parameters[i];
	    		keyValueObj[field.name] = field.value;
	    	}
	    	return keyValueObj;
        };        
        
        /**
         * Performs update of 'target' object property at 'path' with newValue 
         * given a target object a path defined JSON path as string and a new 
         * value to assign.
         * 
         * For instance: applyPath(elfin, 'IDENTIFIANT.NOM', 'Nouveau nom')
         * 
         */
        var applyPath = function(target, path, newValue) {
        	// The path is expected to be a string.
        	if (!angular.isString(path)) {
                  return;
            }
            var pathComponents = path.split('.');
            var objectRef = target;
            var index;
            for (index = 0; index < pathComponents.length; ++index) {
                var pathElement = pathComponents[index];
                if (index == pathComponents.length - 1) {
                	// Assign the new value
                    objectRef[pathElement] = newValue;
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
        };
        
        /**
         * Internal helper to obtain an source object property value 
         * defined at sourcePath.
         * Example: getSourceValue(elfin, 'PARTENAIRE.FOURNISSEUR.VALUE')
         */
        var getSourceValue = function (source, sourcePath) {
            var sourcePathComponents = sourcePath.split('.');
            var objectRef = source;
            var value = null;
            var index;
            for (index = 0; index < sourcePathComponents.length; ++index) {
                var pathElement = sourcePathComponents[index];
                if (index == sourcePathComponents.length - 1) {
                	// Get value at sourcePath
                	value = objectRef[pathElement];
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
            return value;
        }
        
        /**
         * Performs update of 'target' elfin object property at 'targetPath' with new value 
         * found at sourcePath of source elfin object.
         * 
         * For instance: applyPaths(elfin, 'IDENTIFIANT.NOM', 'Nouveau nom', elfinSource, 'GROUPE')
         * 
         */
        var applyPaths = function(target, targetPath, source, sourcePath) {
        	// The paths are expected to be a strings.
        	if (!angular.isString(targetPath) && !angular.isString(sourcePath) ) {
                  return;
            }

            var targetPathComponents = targetPath.split('.');
            var objectRef = target;
            var index;
            
            for (index = 0; index < targetPathComponents.length; ++index) {
                var pathElement = targetPathComponents[index];
                // Check for last level
                if (index == targetPathComponents.length - 1) {
                	// Assign the new value
                    objectRef[pathElement] = getSourceValue(source, sourcePath);
                } else {
                    // Go down a level
                    objectRef = objectRef[pathElement];
                }
            }
        };
        
        return {
        	reorderArrayByPOS:reorderArrayByPOS,
        	buildUrlQueryString:buildUrlQueryString,
        	buildKeyValueObject:buildKeyValueObject,
        	applyPath:applyPath,
        	applyPaths:applyPaths
        };
    });    
    
   
})();


