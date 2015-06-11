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
					function($attrs, $scope, GeoxmlService, $modal, $routeParams,
							$location, $log, hbAlertMessages, hbUtil, userDetails) {

						//$log.debug("    >>>> Using HbDefaultCardController ");
						
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

								}					            
					            
					            
					            
				    		};
				    		
				    	}, true);
						
						
					} ]);
	

})();