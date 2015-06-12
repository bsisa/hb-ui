(function() {

	angular.module('hb5').controller(
			'HbDefaultCardController',
			[
					'$attrs',
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'$log',
					'hbAlertMessages',
					'hbUtil',
					'userDetails',
					'hbTabCacheService',
					function($attrs, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil, userDetails, hbTabCacheService) {

						//$log.debug("    >>>> Using HbDefaultCardController ");
						

                        // ================= Tab state management - start =============
		 				/**
		 				 * Check parent controller and hbTabStateService for complete overview.
		 				 */
		 				var cachedTab = hbTabCacheService.getTabState($location.absUrl());
		 				
		 				/** Create tabState object if not already available in cache,
		 				 */
		 				if (cachedTab === undefined) {
		 					$scope.tabState = { 
			 						"identifiant" : { "active" : true },
			 						"characteristics" : { "active" : false }, 
			 						"attributes" : { "active" : false },
			 						"forme" : { "active" : false },
			 						"annexe" : { "active" : false }
			 				};
		 				} else {
		 					$scope.tabState = cachedTab;
		 				}
	 					/**
	 					 * Link to $parent scope tabState reference.
	 					 */
		 				$scope.$parent.tabState = $scope.tabState;
                        // ================= Tab state management - end ===============						
						
						
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

								}					            
					            
					            
					            
				    		};
				    		
				    	}, true);
						
						
					} ]);
	

})();