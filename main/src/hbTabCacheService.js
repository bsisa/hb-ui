/**
 * 
 * Caches tab state and provide it as a service.
 * 
 * @author Patrick Refondini
 * 
 */

(function() {
	angular.module('hb5').service('hbTabCacheService',
			[ '$log', '$cacheFactory', function($log, $cacheFactory) {
				
				// Create an instance of cache 
				var cache = $cacheFactory('hbTabCacheServiceId');
				$log.debug(">>>> hbTabCacheService CREATED <<<< Cache info =  " + angular.toJson(cache.info()));
				
				return {
					setTabState : function(url, tabState) {
						$log.debug(">>>> setTabState: hbTabCacheService info before: " + angular.toJson(cache.info()));
						//cache.remove(url);
						cache.put(url,tabState);
						$log.debug(">>>> setTabState: hbTabCacheService info after:  " + angular.toJson(cache.info()));
						$log.debug(">>>> tabState: for URL: " + angular.toJson(cache.get(url)));
					},
					getTabState : function(url) {
						return cache.get(url);
					}
				};
			} ]);

})();