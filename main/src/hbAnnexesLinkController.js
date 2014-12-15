(function() {

	angular
			.module('hb5')
			.controller(
					'HbAnnexesLinkController',
					[
							'$scope',
							'$log',
							'$filter',
							'HB_EVENTS',
							'hbUtil',
							function($scope, $log, $filter, HB_EVENTS, hbUtil) {
					        	
					            $scope.refresh = function() {
					            	// Update number of attachment which are not tagged as 'photo'
					            	$scope.annexesNoPhoto = hbUtil.getAnnexesExcludingTag($scope.elfin, 'photo');
					            	// Create direct link to annexe if there is only one
					            	if ($scope.annexesNoPhoto.length === 1) {
					            		var renvois = $filter('annexExcludeTag')($scope.elfin.ANNEXE.RENVOI, "photo");
					            		$scope.link = hbUtil.getLinkFileApiUrl($scope.elfin.ID_G, $scope.elfin.Id, renvois[0].LIEN);
					            	} else { // Create link to ELFIN if there are several or no annex(es)
					            		$scope.link = "/elfin/"+$scope.elfin.ID_G+"/"+$scope.elfin.CLASSE+"/"+$scope.elfin.Id;
					            	}
					            };

					            // Listener on ANNEXE.RENVOI
					            $scope.$watch('elfin.ANNEXE.RENVOI', function() { 
					            	$scope.refresh();
					            }, true);
					            
					            // Initialisation
					            $scope.refresh();
								 
							} ]);

})();
