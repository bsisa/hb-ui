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

    
   
})();


