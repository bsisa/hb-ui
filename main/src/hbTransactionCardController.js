(function() {

	angular.module('hb5').controller(
					'HbTransactionCardController',
					[
					 		'$attrs',
							'$scope',
							'$rootScope',
							'GeoxmlService',
							'$modal',
							'$routeParams',
							'$location',
							'$log',
							'$timeout',
							'hbAlertMessages',
							'hbUtil',
							'HB_EVENTS',
							'userDetails',
							function($attrs, $scope, $rootScope, GeoxmlService, $modal,
									$routeParams, $location, $log, $timeout,
									hbAlertMessages, hbUtil, HB_EVENTS, userDetails) {
					 			
								$log.debug("    >>>> Using HbTransactionCardController");

					            $rootScope.$on(HB_EVENTS.ELFIN_CREATED, function(event, elfin) {

					            	// Update some catalogue properties with live data passed as route parameters 
					            	// while in create mode, following an HB_EVENTS.ELFIN_CREATED event. 
									if ( $attrs.hbMode === "create" ) {
										
										if ($scope.elfin) {
//									        $scope.buildingNb = $routeParams.nocons;
//									        $scope.saiNb = $routeParams.sai;
//									        $scope.elfin.IDENTIFIANT.OBJECTIF = $routeParams.sai;
//									        $scope.elfin.IDENTIFIANT.COMPTE = $routeParams.nocons;
											var currentDate = new Date();
									        $scope.elfin.IDENTIFIANT.DE = hbUtil.getDateInHbTextFormat(currentDate);
									        $scope.elfin.IDENTIFIANT.PAR = currentDate.getFullYear().toString();
									        
									        // Default value from catalogue is not relevant
								        	$scope.elfin.IDENTIFIANT.QUALITE = "";
								        	// Get user abbreviation from userDetails service.
									        $scope.elfin.IDENTIFIANT.AUT = userDetails.getAbbreviation;	

									        // Default value from catalogue contains constatTypes list: Reset it.
									        $scope.elfin.GROUPE = "";
									        
										} else {
											$log.error("elfin should be available after HB_EVENTS.ELFIN_CREATED event notification.");
										}
									} else {
										// Do nothing
									}			            	
					            	
					            });		
							
								
							} ]);

})();
