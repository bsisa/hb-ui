(function() {

	angular
			.module('hb5')
			.controller(
					'HbPrestationListController',
					[
							'$attrs',
							'$scope',
							'GeoxmlService',
							'$routeParams',
							'$log',
							'hbAlertMessages',
							'hbUtil',
							function($attrs, $scope, GeoxmlService,
									$routeParams, $log, hbAlertMessages, hbUtil) {

								$log.debug("    >>>> HbPrestationListController called...");

								// Default order is by "Building management"
								$scope.predicate = 'IDENTIFIANT.OBJECTIF';
								$scope.reverse = false;

								// Object holding user entered search (filter)
								// criteria
								$scope.search = {
									"group" : "",
									"origin" : "",
									"account" : "",
									"goal" : "",
									"from" : "",
									"replacementValue" : "",
									"manager" : "",
									"owner" : "",
									"remark" : ""
								};
								
								$scope.save = function(elfin) {
									elfin.put().then( 
					               			function() { 
					               				//$log.debug("Elfin: " + elfin.ID_G + "/" + elfin.Id + " saved.");
					               			}, 
					               			function(response) { 
					               				//$log.debug("Error Elfin: " + elfin.ID_G + "/" + elfin.Id + " could not be saved.", response.status);
					               				var message = "La mise à jour a échoué (statut de retour: "+ response.status+ ")";
					        					hbAlertMessages.addAlert("danger",message);
					               			} 
					               		);        											
									
									
									
									
								};

							} ]);

})();
