/**
 * 
 * Caches tabs states and provide it as a service.
 * 
 * @author Patrick Refondini
 * 
 */
(function() {
	angular.module('hb5').service('hbTabCacheService',
			[ '$log', '$cacheFactory', function($log, $cacheFactory) {
				
				// Create an instance of hbTabCacheServiceId cache 
				var cache = $cacheFactory('hbTabCacheServiceId');

				return {
					setTabState : function(url, tabState) {
						cache.put(url,tabState);
						//$log.debug(">>>> tabState: for URL: " + angular.toJson(cache.get(url)));
					},
					getTabState : function(url) {
						return cache.get(url);
					}
				};
			} ]);

})();