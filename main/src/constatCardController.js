(function() {

	angular.module('hb5').controller(
			'ConstatCardController',
			[
					'$scope',
					'GeoxmlService',
					'$modal',
					'$routeParams',
					'$location',
					'hbAlertMessages',
					'hbUtil',
					function($scope, GeoxmlService, $modal, $routeParams,
							$location, hbAlertMessages, hbUtil) {

						console.log("    >>>> Using ConstatCardController");

						// TODO: get this dynamically from HB5 catalogue
						$scope.statusTypes = {
							Vu : "Vu",
							SUIVRE : "SUIVRE"
						};

						
// ===
		
				        /**
				         * Modal panel to select an actor.
				         */
				        $scope.chooseActor = function (itemDefinition) {
				        	
				            var modalInstance = $modal.open({
				                templateUrl: '/assets/views/chooseActor.html',
				                scope: $scope,
				                controller: 'ChooseActorCtroller',
				                resolve: {
				                	itemDefinition: function () {
				                    	return itemDefinition;
				                    }               
				                },                
				                backdrop: 'static'
				            });

				            /**
				             * Process modalInstance.close action
				             */
				            modalInstance.result.then(function (result) {
				                var queryString = hbUtil.buildUrlQueryString(result.parameters);
				            	var urlWithQuery = result.url + queryString;
				            	if (result.newWindow && result.newWindow === 'true') {
				            		$window.open(urlWithQuery);
				            	} else {
				            		$location.path(urlWithQuery); 
				            	}
				            }, function () {
				                console.log('Choose params modal dismissed at: ' + new Date());
				            });
				        };						
						
// ===
						
						
						
						
					} ]);
	
	
    angular.module('hb5').controller('ChooseActorCtroller', ['$scope', '$modalInstance', 'itemDefinition', function($scope, $modalInstance, itemDefinition) {
    	$scope.itemDefinition = itemDefinition;
        $scope.ok = function () {
            $modalInstance.close($scope.itemDefinition);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);	
	

})();