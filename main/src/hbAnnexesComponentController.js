(function() {

	    angular
			.module('hb5')
			.controller(
					'HbAnnexesComponentController',
					[
							'$scope',
							'$log',
							'hbUtil',
							function($scope, $log, hbUtil) {
    
									$log.debug("    >>>> Using HbAnnexesComponentController");
							        
									$scope.annexes = [];
									
									$scope.$watch('elfin.Id', function() { 

							    		if ($scope.elfin!=null) {

							    			// Get annexes
								            if ($scope.elfin.ANNEXE) {
									            for (var i = 0; i < $scope.elfin.ANNEXE.RENVOI.length; i++) {
													
									            	var currentRenvoi = $scope.elfin.ANNEXE.RENVOI[i];
													
									            	// Skip photo(s)
													if ( currentRenvoi.VALUE.toLowerCase().indexOf("photo") == -1 ) {
														// Photo found build link
														var currentLink = currentRenvoi;
														var linkApiUrl = hbUtil.getLinkFileApiUrl($scope.elfin.ID_G, $scope.elfin.Id, currentLink.LIEN);
														var linkFileName = hbUtil.getLinkFileName(currentLink.LIEN);
														$scope.annexes.push({link: linkApiUrl, fileName: linkFileName});
													}
												}
								            }				
							    		};
							    		
							    	}, true);
									
									
									        
							    } ]);

})();
