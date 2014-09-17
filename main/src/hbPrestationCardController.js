(function() {

	angular.module('hb5').controller(
					'HbPrestationCardController',
					[
					 		'$attrs',
							'$scope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							function($attrs, $scope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil) {

								$log.debug("    >>>> Using HbPrestationCardController");
								
								/**
								 * Selection lists
								 */
						        $scope.transactions = null;
						        $scope.prestationGroups = null;

						        /**
						         * Validation support
						         */
					        	$scope.numericOnlyRegexp = /^\d*\.?\d*$/;
					        	// To allow negative values:
					        	//$scope.numericOnlyRegexp = /^[-]?\d*\.?\d*$/;						        
						        
					            /**
					             * Perform operations once we are guaranteed to have access to $scope.elfin instance.
					             */
						    	$scope.$watch('elfin.Id', function() { 
						    		
						    		if ($scope.elfin!=null) {
							    		if ($attrs.hbMode === "create") {
											if ($scope.elfin) {
												// Template fields clean up.
												$scope.elfin.GROUPE = '';
											} else {
												$log.debug("elfin should be available once $watch('elfin.Id') has been triggered.");
											}
										} else {
											// Do nothing
										}										
						    		};
						    		
						    	}, true);
						        
								
								/**
								 * Maintains the list of TRANSACTION linked to this PRESTATION
								 * 
								 * TODO: Review: transactions must match both:
								 * 1) No SAI (elfin.IDENTIFIANT.OBJECTIF)
								 * 2) Owner (... per node Id,ID_G or ...)
								 * and should thus no only be triggered by elfin.IDENTIFIANT.OBJECTIF change but also
								 * elfin.PARTENAIRE.PROPRIETAIRE.Id modification. 
								 */
								$scope.$watch('elfin.IDENTIFIANT.OBJECTIF', function() { 

						    		if ($scope.elfin!=null) {
							            
							            var xpathForTransactions = "//ELFIN[IDENTIFIANT/OBJECTIF='"+$scope.elfin.IDENTIFIANT.OBJECTIF+"']";
							            // TODO: constatsCollectionId must come from server configuration resource.
							            $log.debug("TODO: HbImmeubleCardController: prestationCollectionId must come from server configuration resource.");
							            var transactionsCollectionId = 'G20040930101030011';
							            GeoxmlService.getCollection(transactionsCollectionId).getList({"xpath" : xpathForTransactions})
											.then(function(elfins) {
													$scope.transactions = elfins;
												},
												function(response) {
													var message = "Le chargement des TRANSACTIONs a échoué (statut de retour: "+ response.status+ ")";
										            hbAlertMessages.addAlert("danger",message);
												});
							            
						    		}
						    		
						    	}, true);
								
								
					            /**
					             * Asychronous PRESTATION template preloading
					             */
					            GeoxmlService.getNewElfin("PRESTATION").get()
					            .then(function(prestation) {
					            		// Get constat types from catalogue
					            		$scope.prestationGroups = hbUtil.buildArrayFromCatalogueDefault(prestation.GROUPE);
					            		// TODO: Waiting for clarifications
					            		//$scope.prestationXXX = hbUtil.buildArrayFromCatalogueDefault(prestation.CARACTERISTIQUE.CAR2.VALEUR);
									},
									function(response) {
										var message = "Les valeurs par défaut pour la CLASSE PRESTATION n'ont pas pu être chargées. (statut de retour: "+ response.status+ ")";
										hbAlertMessages.addAlert("danger",message);
									});

							} ]);

})();
