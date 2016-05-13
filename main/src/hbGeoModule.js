/**
 * 
 * hbUi.geo module provides GIS JS client functionalities relying on hb-geo-api microservice.  
 * 
 * Intended for module dependencies, config, run definitions. 
 * Constants, controllers, factories, filters should be package to their own hbGeoXXX.js 
 * depending on their increasing complexity, verbosity, this to avoid cluttering. 
 *
 * @author Patrick Refondini 
 */
(function() {
	
    angular.module('hbUi.geo', []);
	
    // ================================================================
    // ====                      Config                            ====
    // ================================================================    
    
	/**
	 * Turns debug log level on and off
	 */
    angular.module('hbUi.geo').config(['$logProvider', function($logProvider) {
        $logProvider.debugEnabled(clientDebugEnabled);
    }]);

    
    /**
     * Benefit from HTML5 history API, provides nicer RESTful URLs.
     * Supported by all browsers (with IE only from version 10).
     * Fallback to hashbang mode if necessary. 
     */
    angular.module('hbUi.geo').config(['$locationProvider', function($locationProvider) {
    	$locationProvider.html5Mode(true);
    }]);    
    
    
    /**
     * Prevent `unsafe` token be placed before URL such as file:// or chrome-extension:// etc...
     */
    angular.module('hbUi.geo').config(['$compileProvider', function( $compileProvider ) {   
    	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
    }]);
    
   
})();


