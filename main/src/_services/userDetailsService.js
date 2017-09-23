/**
 * 
 * Caches userDetails and provide them as a service.
 * 
 * @author Patrick Refondini
 * 
 */

(function() {
	angular.module('hb5').service('userDetails',
			[ 'GeoxmlService', '$log', 'hbAlertMessages', function(GeoxmlService, $log, hbAlertMessages) {

				var userDetailsCache = null;
				
				/* Obtain user details from GeoxmlService */
				GeoxmlService.getWhoAmI().get().then(function(userDetails) {
					// Make user details available to MenuController scope
					// to display user name, family name, surname in menu bar.
					userDetailsCache = userDetails;
				}, function(response) {
	            	var errorMessage = "Error with status code " + response.status + " while getting user details information (whoami).";
	            	$log.error(errorMessage);
	            	hbAlertMessages.addAlert("danger","Les informations utilisateur n'ont pu être obtenues.");
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