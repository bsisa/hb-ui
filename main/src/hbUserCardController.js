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
					'$rootScope',
					'HB_EVENTS',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil, $rootScope, HB_EVENTS) {

						$log.debug("    >>>> Using HbUserCardController ");
						
						// TODO: get this dynamically from HB5 catalogue
						$scope.qualiteList = {
							"Gérant" : "Gérant",
							"Concierge" : "Concierge",
							"Responsable chauffage" : "Responsable chauffage",
							"Entreprise" : "Entreprise",
							"Collaborateur" : "Collaborateur"
						};		
						
						// Actor linked to the current user.
						$scope.selected = { "collaborator" : null };
						// Actors selection list 
						//$scope.collaboratorActors = null;
						
						// Plain text passwords used to obtain the encrypted password signature. 
						// Must never be persisted nor logged.
						$scope.pwd1 = null;
						$scope.pwd2 = null;
						
						// Used to obtain hash for plain text passwords
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
						

				        $scope.getElfinActor = function (collectionId, elfinId) {
				        	
				        	if (GeoxmlService.validateId(collectionId) && GeoxmlService.validateId(elfinId)) {
						        GeoxmlService.getElfin(collectionId, elfinId).get()
						        .then(function(elfin) {
						        	// Force CAR array sorting by POS attribute
						        	// TODO: Evaluate how to guarantee this in the produced JSON on the server in a single place.
						        	// DONE: Safe array ordering is mandatory to prevent null accessor related exception
						        	//       Need review of other similar operations
						        	if ( elfin['CARACTERISTIQUE'] != null && elfin['CARACTERISTIQUE']['CARSET'] != null && elfin['CARACTERISTIQUE']['CARSET']['CAR'] != null) {
						        		hbUtil.reorderArrayByPOS(elfin['CARACTERISTIQUE']['CARSET']['CAR']);
						        	}
						        	$log.debug(">>>>>>>>>>>> collaboratorActor.Id = " + elfin.Id);
						        	$scope.selected.collaborator = elfin;
						        	}, function(response) {
						        	var message = "Le chargement des informations a échoué (statut de retour: " + response.status + ")";
						            hbAlertMessages.addAlert("danger",message);
						        });
				            }
				            else {
				                var message = "Les identifiants de collection (" + $scope.collectionId + " ) et/ou (" + $scope.elfinId + ") ne sont pas corrects";
				                hbAlertMessages.addAlert("warning",message);
				            }        		
			        		
			        	};

			            // Load ELFIN collaborator ACTOR only once main elfin (here USER) has been loaded
			            $rootScope.$on(HB_EVENTS.ELFIN_LOADED, function(event, elfin) {
			            	
				        	if ($scope.elfin.PARTENAIRE.USAGER.Id && $scope.elfin.PARTENAIRE.USAGER.ID_G) {
				        		$scope.getElfinActor($scope.elfin.PARTENAIRE.USAGER.ID_G, $scope.elfin.PARTENAIRE.USAGER.Id);	
				        	}			            	

			            });			        	
			        	
					} ]);
	

})();