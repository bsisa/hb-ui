/**
 * Created by guy on 19.01.14.
 */

(function() {
	// TODO: solve functions naming clash between 'mgcrea.ngStrap' and 'ui.bootstrap' on $modal
	//['ngAnimate', 'ngSanitize', 'mgcrea.ngStrap']
	//  var hb5 = angular.module('hb5', ['geoxml', 'ngRoute', 'ui.bootstrap', 'localytics.directives']);	
    var hb5 = angular.module('hb5', ['ngAnimate', 'ngSanitize', 'geoxml', 'ngRoute', 'ui.bootstrap', 'localytics.directives']);
	
    hb5.run(['Restangular', 'sharedMessages', '$location', '$window', function(Restangular, sharedMessages, $location, $window){
        Restangular.setErrorInterceptor(
    	        function(response) {
    	        	if (response.status == 500) {
    	        		sharedMessages.setErrorMessage("Erreur du serveur, veuillez s.v.p. prendre contact avec votre administrateur. Note: Vérifiez que la base de donnée soit accessible.");
    	        	} else if (response.status == 401) {
    	        		console.log("Login required... ");
    	        		$window.location.href='/login';
    	        		//TODO: we might use the following once we create an new custom AngularJS integrated login form 
    	        		//$location.path('/login'); 
    	        	} else {
    	        		sharedMessages.setErrorMessage("Une erreur s'est produite, veuillez s.v.p. prendre contact avec votre administrateur et lui communiquer le statut suivant: HTTP ERROR: " + response.status );
    	        	}
    	          console.log("Restangular error interceptor caught: status: " + response.status + ", errors: " + response.data.errors + ", type: " + typeof response);
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
    				// Reset possible former error message to null
    	        	sharedMessages.setErrorMessage(null);
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
    
    
    hb5.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/welcome.html',
                controller: function($scope) {}
            })
            .when('/elfin/:collectionId/IMMEUBLE/:elfinId', {
                templateUrl: 'views/IMMEUBLE_card_view.html',
                controller: 'DefaultCardController'
            })            
            .when('/elfin/:collectionId/:classe/:elfinId', {
                templateUrl: 'views/default_card_view.html',
                controller: 'DefaultCardController'
            })
            .when('/elfin/:collectionId/IMMEUBLE', {
                templateUrl: 'views/IMMEUBLE.html',
                controller: 'DefaultListsController'
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
	 * Small service used to exchange messages data between miscellaneous controllers.
	 * For instance when deleting a card the success message must be displayed on the
	 * redirect to page within redirect page controller scope.
	 */
	hb5.service('sharedMessages', function () {
        var statusMessage = {
            data: null
        };
        var errorMessage = {
            data: null
        };        

        return {
            getStatusMessage:function () {
                return statusMessage;
            },
            setStatusMessage:function (value) {
            	statusMessage.data = value;
            },
            getErrorMessage:function () {
                return errorMessage;
            },
            setErrorMessage:function (value) {
            	errorMessage.data = value;
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
		
        return {
        	reorderArrayByPOS:reorderArrayByPOS
            
        };
    });	

   
})();


