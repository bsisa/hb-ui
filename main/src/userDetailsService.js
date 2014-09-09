/**
 * 
 * Caches userDetails and provide them as a service.
 * 
 * @author Patrick Refondini
 * 
 */

(function() {
	angular.module('hb5').service('userDetails',
			[ 'GeoxmlService', '$log', function(GeoxmlService, $log) {

				var userDetailsCache = null;
				
				/* Obtain user details from GeoxmlService */
				GeoxmlService.getWhoAmI().get().then(function(userDetails) {
					// Make user details available to MenuController scope
					// to display user name, family name, surname in menu bar.
					userDetailsCache = userDetails;
				});

				return {
					getAbbreviation : function() {
						return userDetailsCache.abbreviation;
					},
					getRoles : function() {
						return userDetailsCache.roles;
					}
				};
			} ]);

})();