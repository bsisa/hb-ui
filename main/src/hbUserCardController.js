(function() {

	angular.module('hb5').controller(
			'HbUserCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil) {

						$log.debug("    >>>> Using HbUserCardController ");
						
						// TODO: get this dynamically from HB5 catalogue
						$scope.qualiteList = {
							"Gérant" : "Gérant",
							"Concierge" : "Concierge",
							"Responsable chauffage" : "Responsable chauffage",
							"Entreprise" : "Entreprise",
							"Collaborateur" : "Collaborateur"
						};		
						
						$scope.pwd1 = null;
						$scope.pwd2 = null;
						
						$scope.hash = function(pwd) {
							// Check pwd1 === pwd2 ?
							GeoxmlService.getHash(pwd).get()
					        .then(
					        	function(pwdHash) {
					        		$scope.elfin.IDENTIFIANT.ALIAS = pwdHash.hash;
					        	}, 
					        	function(response) {
					        		var message = "La modification du mot de passe a échoué (statut de retour: " + response.status + ")";
					        		hbAlertMessages.addAlert("danger",message);
					        	}
					        );
							// Reset values at each submission.
							$scope.pwd1 = null;
							$scope.pwd2 = null;
						};
						
					} ]);
	

})();