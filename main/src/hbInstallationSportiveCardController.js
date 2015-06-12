(function() {

	angular.module('hb5').controller(
			'HbInstallationSportiveCardController',
			[
					'$attrs',
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbQueryService',
					'hbUtil',
					'userDetails',					
					function($attrs, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbQueryService, hbUtil, userDetails) {

						//$log.debug("    >>>> Using HbInstallationSportiveCardController ");
						
						// we do not expect to have much logic here which shall not 
						// go to hbCardContainerController. 
						
			        	// Navigate to PARENT object linked to the current one by @SOURCE value if present with the expected pattern ID_G/CLASSE/Id
			        	$scope.viewParent = function() {
			        		$location.path('/elfin/'+$scope.elfin.SOURCE);	
			        	};						
						
						
				    	// Check when elfin instance becomes available 
				    	$scope.$watch('elfin.Id', function() { 
				    		
				    		if ($scope.elfin!=null) {						
						
					            // Make IMMEUBLE photo available
					            $scope.updatePhotoSrc();
			            
				            	// while in create mode 
								if ( $attrs.hbMode === "create" ) {

									if ($routeParams.idg && $routeParams.classe && $routeParams.id) {
										// Generic link to creation source/parent if such information is provided
										$scope.elfin.SOURCE = $routeParams.idg +"/"+$routeParams.classe+"/"+$routeParams.id;
									}
									// Get user abbreviation from userDetails service
									$scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation();
									$scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(new Date());
								} else {
						    			// Try loading linked EQUIPEMENT_SPORTIF only if not in create mode.
						    			var xpathForEquipementsSportifs = "//ELFIN[@CLASSE='EQUIPEMENT_SPORTIF' and @SOURCE='"+$scope.elfin.ID_G+"/"+$scope.elfin.CLASSE + "/" +$scope.elfin.Id +"']";
							            hbQueryService.getEquipementsSportifs(xpathForEquipementsSportifs)
											.then(function(elfins) {
								    			$scope.equipementsSportifs = elfins;
												},
												function(response) {
													var message = "Le chargement des EQUIPEMENT_SPORTIFs a échoué (statut de retour: "+ response.status+ ")";
										            hbAlertMessages.addAlert("danger",message);
												});
					    		}					            
				    		};
				    		
				    	}, true);
						
				    	
						/**
						 * Triggers a redirection to the EQUIPEMENT_SPORTIF creation URL with current
						 * INSTALLATION_SPORTIVE ID_G, CLASSE, Id information passed as parameters.
						 * Must not be effective while in create mode (no association is 
						 * relevant while the EQUIPEMENT_SPORTIF creation is ongoing/pending.)
						 */ 
						$scope.createNewEquipementSportif = function() {										
							if ($attrs.hbMode != "create") {
						        // id,classe,idg provide generic link to creation source/parent
								var searchObj = {id: $scope.elfin.Id, classe: $scope.elfin.CLASSE, idg: $scope.elfin.ID_G }
								$location.search(searchObj).path( "/elfin/create/EQUIPEMENT_SPORTIF" );
							}
						};					    	
				    	
				    	
					} ]);
	

})();